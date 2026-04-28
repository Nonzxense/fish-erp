package main

import (
	"context"
	"fish/internal/database"
	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	transactionDomain "fish/internal/domain/transaction"
	"fish/internal/repository"
	"fish/internal/service/container"
	"fish/internal/service/invoice"
	"fish/internal/service/party"
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
	partyService       *party.PartyService
	invoiceService     *invoice.InvoiceService
}

// NewApp creates a new App application struct
func NewApp() *App {
	db, _, err := database.NewDB()
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(
		&transactionDomain.Transaction{},
		&partyDomain.Party{},
		&invoiceDomain.FishSaleInvoice{},
		&containerDomain.FishContainer{},
		&containerDomain.FishSaleDetail{},
		&containerDomain.Container{},
	)
	if err != nil {
		panic(err)
	}

	transactionRepo := repository.NewTransactionRepository(db)
	containerRepo := repository.NewContainerRepository(db)
	partyRepo := repository.NewPartyRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)

	return &App{
		db:                 db,
		transactionService: transaction.NewTransactionService(transactionRepo),
		containerService:   container.NewContainerService(containerRepo),
		partyService:       party.NewPartyService(partyRepo),
		invoiceService:     invoice.NewInvoiceService(invoiceRepo, partyRepo, containerRepo),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func runSQLFile(db *gorm.DB, path string) error {
	sqlBytes, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return db.Exec(string(sqlBytes)).Error
}
