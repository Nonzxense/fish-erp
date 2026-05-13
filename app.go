package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"fish/internal/database"

	containerDomain "fish/internal/domain/container"
	invoiceDomain "fish/internal/domain/invoice"
	partyDomain "fish/internal/domain/party"
	transactionDomain "fish/internal/domain/transaction"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"

	"fish/internal/repository"

	"fish/internal/service/container"
	"fish/internal/service/invoice"
	"fish/internal/service/party"
	"fish/internal/service/transaction"
	truckinvoice "fish/internal/service/truck_invoice"

	"gorm.io/gorm"
)

// App struct
type App struct {
	ctx                 context.Context
	db                  *gorm.DB
	transactionService  *transaction.TransactionService
	containerService    *container.ContainerService
	partyService        *party.PartyService
	invoiceService      *invoice.InvoiceService
	truckInvoiceService *truckinvoice.TruckInvoiceService
}

// NewApp creates a new App application struct
func NewApp() *App {

	configDir, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}

	appDir := filepath.Join(configDir, "fish")
	err = os.MkdirAll(appDir, os.ModePerm)
	if err != nil {
		panic(err)
	}

	logPath := filepath.Join(appDir, "app.log")

	logFile, err := os.OpenFile(
		logPath,
		os.O_APPEND|os.O_CREATE|os.O_WRONLY,
		0666,
	)

	if err != nil {
		panic(err)
	}

	log.SetOutput(logFile)

	log.Println("APP STARTING")

	db, _, err := database.NewDB()
	if err != nil {
		log.Printf("DB INIT FAILED: %+v", err)
		panic(err)
	}

	db = db.Debug()

	log.Println("RUNNING MIGRATIONS")

	err = db.AutoMigrate(
		&transactionDomain.Transaction{},
		&partyDomain.Party{},
		&invoiceDomain.FishSaleInvoice{},
		&invoiceDomain.FishPurchaseInvoice{},
		&containerDomain.FishContainer{},
		&containerDomain.FishSaleDetail{},
		&containerDomain.FishPurchaseDetail{},
		&containerDomain.Container{},
		&truckInvoiceDomain.TruckInvoice{},
		&truckInvoiceDomain.CustomerContainer{},
		&truckInvoiceDomain.HelperWage{},
		&truckInvoiceDomain.OtherExpense{},
		&truckInvoiceDomain.CustomerContainerItem{},
	)

	if err != nil {
		log.Printf("MIGRATION FAILED: %+v", err)
		panic(err)
	}

	log.Println("MIGRATIONS COMPLETE")

	transactionRepo := repository.NewTransactionRepository(db)
	containerRepo := repository.NewContainerRepository(db)
	partyRepo := repository.NewPartyRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)
	truckInvoiceRepo := repository.NewTruckInvoiceRepository(db)

	return &App{
		db:                  db,
		transactionService:  transaction.NewTransactionService(transactionRepo),
		containerService:    container.NewContainerService(containerRepo),
		partyService:        party.NewPartyService(partyRepo),
		invoiceService:      invoice.NewInvoiceService(invoiceRepo, partyRepo, containerRepo),
		truckInvoiceService: truckinvoice.NewTruckInvoiceService(truckInvoiceRepo),
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
