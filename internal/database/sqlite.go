package database

import (
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func NewDB() (*gorm.DB, string, error) {

	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, "", err
	}

	appDir := filepath.Join(configDir, "fish")
	err = os.MkdirAll(appDir, os.ModePerm)
	if err != nil {
		return nil, "", err
	}

	dbPath := filepath.Join(appDir, "app.db")

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, "", err
	}

	if err := db.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
		return nil, "", err
	}

	return db, dbPath, nil
}
