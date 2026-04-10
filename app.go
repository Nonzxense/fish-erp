package main

import (
	"context"
	"fish/internal/database"
	"fish/internal/repository"
	"fish/internal/service/container"
	"fish/internal/service/transaction"
	"os"

	"gorm.io/gorm"
)

// App struct
type App struct {
	ctx                context.Context
	db                 *gorm.DB
	transactionService *transaction.TransactionService
	containerService   *container.ContainerService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, _, err := database.NewDB()
	if err != nil {
		panic(err)
	}

	a.db = db

	// Run schema if first run
	var count int64
	a.db.Raw(`
		SELECT count(*) 
		FROM sqlite_master 
		WHERE type='table' AND name='transactions'
	`).Scan(&count)

	if count == 0 {
		err = runSQLFile(a.db, "internal/database/schema.sql")
		if err != nil {
			panic(err)
		}
	}

	transactionRepo := repository.NewTransactionRepository(a.db)
	a.transactionService = transaction.NewTransactionService(transactionRepo)

	containerRepo := repository.NewContainerRepository(a.db)
	a.containerService = container.NewContainerService(containerRepo)
}

func runSQLFile(db *gorm.DB, path string) error {
	sqlBytes, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return db.Exec(string(sqlBytes)).Error
}
