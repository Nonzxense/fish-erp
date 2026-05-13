package truckinvoice

import (
	"fish/internal/domain"
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
	truckInvoiceDomain "fish/internal/domain/truck_invoice"
	"fish/internal/repository"
	"fish/internal/utils/count"
	"fmt"
	"time"
)

type TruckInvoiceService struct {
	repo *repository.TruckInvoiceRepository
}

func NewTruckInvoiceService(repo *repository.TruckInvoiceRepository) *TruckInvoiceService {
	return &TruckInvoiceService{repo: repo}
}

func (s *TruckInvoiceService) Create(input CreateTruckInvoiceInput) error {
	c, err := count.GetCountForMonth[truckInvoiceDomain.TruckInvoice](s.repo.GetDB(), input.OccurredAt)
	if err != nil {
		return err
	}

	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return err
	}

	sequenceID := fmt.Sprintf("TI-%d%02d-%04d",
		input.OccurredAt.In(loc).Year(),
		input.OccurredAt.In(loc).Month(),
		c+1,
	)

	invoice := &truckInvoiceDomain.TruckInvoice{
		BaseInvoice: invoiceDomain.BaseInvoice{
			ID:        sequenceID,
			CreatedAt: input.OccurredAt,
			Type:      input.Type,
			Status:    input.Status,
			Note:      input.Note,
		},
		CarPlate:   input.CarPlate,
		DriverName: input.DriverName,
		DriverWage: common.NewMoney(input.DriverWage),
	}

	// Helpers
	for _, h := range input.Helpers {
		invoice.Helpers = append(invoice.Helpers, truckInvoiceDomain.HelperWage{
			Name:      h.Name,
			Amount:    common.NewMoney(h.Amount),
			InvoiceID: sequenceID,
		})
	}

	// Other Expenses
	for _, e := range input.OtherExpenses {
		invoice.OtherExpenses = append(invoice.OtherExpenses, truckInvoiceDomain.OtherExpense{
			Description: e.Description,
			Amount:      common.NewMoney(e.Amount),
			InvoiceID:   sequenceID,
		})
	}

	// Customers
	for _, c := range input.Customers {
		var totalAmount common.Money
		customer := truckInvoiceDomain.CustomerContainer{
			CustomerID: c.CustomerID,
			InvoiceID:  sequenceID,
			PaidAmount: common.Money(c.PaidAmount),
			Items:      []truckInvoiceDomain.CustomerContainerItem{},
		}

		for _, ci := range c.Items {
			customer.Items = append(customer.Items, truckInvoiceDomain.CustomerContainerItem{
				Type:  ci.Type,
				Qty:   ci.Qty,
				Price: common.NewMoney(ci.Price),
			})

			totalAmount += common.NewMoney(ci.Price * float64(ci.Qty))
		}

		customer.TotalAmount = totalAmount
		customer.RefreshStatus()
		invoice.Customers = append(invoice.Customers, customer)
	}

	invoice.TotalIncome, invoice.TotalExpense = s.CalculateTotal(*invoice)

	return s.repo.Create(invoice)
}

func (s *TruckInvoiceService) GetTruckInvoices(filter truckInvoiceDomain.TruckInvoiceFilter) (domain.PageResult[truckInvoiceDomain.TruckInvoice], error) {
	invoices, total, err := s.repo.FindAll(filter)

	pageResult := domain.PageResult[truckInvoiceDomain.TruckInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

func (s *TruckInvoiceService) GetTruckInvoice(id string) (truckInvoiceDomain.TruckInvoice, error) {
	return s.repo.FindOne(id)
}

func (s *TruckInvoiceService) CalculateTotal(invoice truckInvoiceDomain.TruckInvoice) (common.Money, common.Money) {
	var totalIncome common.Money
	var totalExpense common.Money = invoice.DriverWage

	for _, customer := range invoice.Customers {
		for _, item := range customer.Items {
			totalIncome += item.Price.Mul(item.Qty)
		}
	}

	for _, otherExpense := range invoice.OtherExpenses {
		if otherExpense.Amount > 0 {
			totalExpense += otherExpense.Amount
		}
	}

	for _, helper := range invoice.Helpers {
		if helper.Amount > 0 {
			totalExpense += helper.Amount
		}
	}

	return totalIncome, totalExpense
}
