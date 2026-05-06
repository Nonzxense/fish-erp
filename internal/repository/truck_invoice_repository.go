package repository

import (
	partyDomain "fish/internal/domain/party"
	"fish/internal/domain/transaction"
	domain "fish/internal/domain/truck_invoice"
	"fish/internal/utils/ptr"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TruckInvoiceRepository struct {
	db *gorm.DB
}

func NewTruckInvoiceRepository(db *gorm.DB) *TruckInvoiceRepository {
	return &TruckInvoiceRepository{db: db}
}

func (r *TruckInvoiceRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *TruckInvoiceRepository) Create(ti *domain.TruckInvoice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		// invoice
		if err := tx.Omit("Helpers", "OtherExpenses", "Customers").Create(ti).Error; err != nil {
			return err
		}

		// helpers
		for i := range ti.Helpers {
			helper := &ti.Helpers[i]
			helper.InvoiceID = ti.ID

			if err := tx.Create(helper).Error; err != nil {
				return err
			}
		}

		// expenses
		for i := range ti.OtherExpenses {
			expense := &ti.OtherExpenses[i]
			expense.InvoiceID = ti.ID

			if err := tx.Create(expense).Error; err != nil {
				return err
			}
		}

		// customers
		for i := range ti.Customers {
			customer := &ti.Customers[i]
			customer.InvoiceID = ti.ID

			if err := tx.Create(customer).Error; err != nil {
				return err
			}

			if customer.Status == "paid" {
				var p partyDomain.Party
				if err := tx.Select("name").First(&p, "id = ?", customer.CustomerID).Error; err != nil {
					return err
				}

				t := transaction.Transaction{
					ID:         uuid.NewString(),
					InvoiceID:  &ti.ID,
					Amount:     float64(customer.Total()),
					OccurredAt: ti.CreatedAt,
					Type:       "income",
					Category:   ptr.String("ค่าบรรทุกปลา"),
					Note:       ptr.String("ใบเสร็จ " + ti.ID + " ลูกค้า " + p.Name),
				}

				if err := tx.Create(&t).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (r *TruckInvoiceRepository) FindAll(filter domain.TruckInvoiceFilter) ([]domain.TruckInvoice, int64, error) {
	invoices := []domain.TruckInvoice{}
	var total int64

	query := r.db.Model(&domain.TruckInvoice{})

	if filter.CarPlate != nil {
		query = query.Where("car_plate LIKE ?", "%"+*filter.CarPlate+"%")
	}

	if filter.ID != nil {
		query = query.Where("id LIKE ?", "%"+*filter.ID+"%")
	}

	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.FromDate != nil {
		query = query.Where("created_at >= ?", *filter.FromDate)
	}

	if filter.ToDate != nil {
		query = query.Where("created_at <= ?", *filter.ToDate)
	}

	if filter.Page > 0 && filter.PageSize > 0 {
		offset := (filter.Page - 1) * filter.PageSize
		query = query.Offset(offset).Limit(filter.PageSize)
	}

	err := query.
		Order("id DESC").
		Find(&invoices).
		Error

	return invoices, total, err
}
