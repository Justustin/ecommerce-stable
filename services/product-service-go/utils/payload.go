package utils

import (
	"encoding/json"
)

// PayloadToMap converts a struct to a map[string]interface{}
// This is useful for dynamic GORM queries where we want to
// filter by non-nil fields only
func PayloadToMap(payload interface{}) (map[string]interface{}, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, err
	}

	// Remove nil values and pagination fields
	cleanResult := make(map[string]interface{})
	for key, value := range result {
		if value != nil && key != "page" && key != "limit" {
			cleanResult[key] = value
		}
	}

	return cleanResult, nil
}
