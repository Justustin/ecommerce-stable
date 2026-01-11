package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/lakoo/product-service-go/config"
	"github.com/lakoo/product-service-go/db"
	"github.com/lakoo/product-service-go/internal/controller"
	"github.com/lakoo/product-service-go/internal/repository"
	"github.com/lakoo/product-service-go/internal/service"
	"github.com/lakoo/product-service-go/utils"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	database, err := db.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	log.Println("Connected to database successfully")

	// Initialize layers
	productRepo := repository.NewProductRepository(database)
	productSvc := service.NewProductService(productRepo)
	productCtrl := controller.NewProductController(productSvc)

	// Setup router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(utils.Recovery())
	router.Use(utils.Logger())
	router.Use(utils.CORS())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "product-service-go"})
	})

	// API routes - matching TypeScript version
	api := router.Group("/api")
	{
		products := api.Group("/products")
		{
			products.POST("", productCtrl.CreateProduct)
			products.GET("", productCtrl.GetProducts)
			products.GET("/:slug", productCtrl.GetProductBySlug)
			products.GET("/id/:id", productCtrl.GetProductByID)
			products.PATCH("/:id", productCtrl.UpdateProduct)
			products.PATCH("/:id/publish", productCtrl.PublishProduct)
			products.DELETE("/:id", productCtrl.DeleteProduct)
			products.POST("/:id/images", productCtrl.AddImages)
			products.POST("/:id/variants", productCtrl.CreateVariant)
			products.GET("/variants/:variantId", productCtrl.GetVariantByID)
		}
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down server...")
		os.Exit(0)
	}()

	addr := ":" + cfg.Port
	log.Printf("Product Service (Go) starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
