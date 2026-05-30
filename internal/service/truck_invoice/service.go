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
	_ "time/tzdata"

	"github.com/google/uuid"
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

	// Shipping
	for _, c := range input.Customers {
		var totalAmount common.Money
		shippingInvoice := truckInvoiceDomain.ShippingInvoice{
			ID:         uuid.NewString(),
			CustomerID: c.CustomerID,
			InvoiceID:  sequenceID,
			PaidAmount: common.Money(c.PaidAmount),
			Items:      []truckInvoiceDomain.ShippingItem{},
		}

		for _, item := range c.Items {
			shippingInvoice.Items = append(shippingInvoice.Items, truckInvoiceDomain.ShippingItem{
				Type:  item.Type,
				Qty:   item.Qty,
				Price: common.NewMoney(item.Price),
			})

			totalAmount += common.NewMoney(item.Price * float64(item.Qty))
		}

		shippingInvoice.TotalAmount = totalAmount
		shippingInvoice.RefreshStatus()
		invoice.ShippingInvoices = append(invoice.ShippingInvoices, shippingInvoice)
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
	return s.repo.GetByID(id)
}

func (s *TruckInvoiceService) GetShippingInvoicesByPartyID(partyID string) (domain.PageResult[truckInvoiceDomain.ShippingInvoice], error) {
	invoices, total, err := s.repo.GetShippingInvoicesByPartyID(partyID)

	pageResult := domain.PageResult[truckInvoiceDomain.ShippingInvoice]{
		Data:  invoices,
		Total: total,
	}

	return pageResult, err
}

func (s *TruckInvoiceService) CalculateTotal(invoice truckInvoiceDomain.TruckInvoice) (common.Money, common.Money) {
	var totalIncome common.Money
	var totalExpense common.Money = invoice.DriverWage

	for _, customer := range invoice.ShippingInvoices {
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
