package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/lakoo/product-service-go/internal/config"
	"github.com/lakoo/product-service-go/internal/handler"
	"github.com/lakoo/product-service-go/internal/middleware"
	"github.com/lakoo/product-service-go/internal/repository"
	"github.com/lakoo/product-service-go/internal/service"
	"github.com/lakoo/product-service-go/pkg/database"
)

func main() {
	// Load .env file if exists
	_ = godotenv.Load()

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize repositories
	productRepo := repository.NewProductRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)

	// Initialize services
	productSvc := service.NewProductService(productRepo, categoryRepo)

	// Initialize handlers
	productHandler := handler.NewProductHandler(productSvc)
	categoryHandler := handler.NewCategoryHandler(productSvc)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(middleware.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "product-service-go",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Product routes
		products := api.Group("/products")
		{
			products.POST("", productHandler.CreateProduct)
			products.GET("", productHandler.GetProducts)
			products.GET("/:slug", productHandler.GetProductBySlug)
			products.GET("/id/:id", productHandler.GetProductByID)
			products.PATCH("/:id", productHandler.UpdateProduct)
			products.DELETE("/:id", productHandler.DeleteProduct)
			products.PATCH("/:id/publish", productHandler.PublishProduct)
			products.POST("/:id/images", productHandler.AddImages)
			products.POST("/:id/variants", productHandler.CreateVariant)
			products.POST("/:id/brands", productHandler.AssignToBrand)
		}

		// Variant routes
		api.GET("/variants/:variantId", productHandler.GetVariantByID)

		// Brand products routes
		api.GET("/brands/:brandId/products", productHandler.GetBrandProducts)

		// Category routes
		categories := api.Group("/categories")
		{
			categories.POST("", categoryHandler.CreateCategory)
			categories.GET("", categoryHandler.GetAllCategories)
			categories.GET("/tree", categoryHandler.GetRootCategories)
			categories.GET("/:slug", categoryHandler.GetCategoryBySlug)
			categories.GET("/id/:id", categoryHandler.GetCategoryByID)
			categories.PATCH("/:id", categoryHandler.UpdateCategory)
			categories.DELETE("/:id", categoryHandler.DeleteCategory)
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

	// Start server
	addr := ":" + cfg.Port
	log.Printf("Product Service (Go) starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
