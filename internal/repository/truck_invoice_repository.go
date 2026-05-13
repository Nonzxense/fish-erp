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
		t := make([]transaction.Transaction, 0,
			len(ti.Helpers)+
				len(ti.OtherExpenses)+
				len(ti.Customers),
		)

		// invoice
		if err := tx.Omit("Helpers", "OtherExpenses", "Customers").Create(ti).Error; err != nil {
			return err
		}

		// helpers
		if len(ti.Helpers) > 0 {
			for i := range ti.Helpers {
				helper := &ti.Helpers[i]
				helper.InvoiceID = ti.ID

				if err := tx.Create(helper).Error; err != nil {
					return err
				}

				t = append(t, transaction.Transaction{
					ID:         uuid.NewString(),
					InvoiceID:  &ti.ID,
					Amount:     helper.Amount,
					OccurredAt: ti.CreatedAt,
					Type:       "expense",
					Category:   ptr.String("ค่าจ้างเด็กรถ"),
					Note:       ptr.String("ใบเสร็จ " + ti.ID + " เด็กรถ " + helper.Name),
				})
			}
		}

		// expenses
		if len(ti.OtherExpenses) > 0 {
			for i := range ti.OtherExpenses {
				expense := &ti.OtherExpenses[i]
				expense.InvoiceID = ti.ID

				if err := tx.Create(expense).Error; err != nil {
					return err
				}

				t = append(t, transaction.Transaction{
					ID:         uuid.NewString(),
					InvoiceID:  &ti.ID,
					Amount:     expense.Amount,
					OccurredAt: ti.CreatedAt,
					Type:       "expense",
					Category:   ptr.String("ค่าใช้จ่ายรถบรรทุก"),
					Note:       ptr.String("ใบเสร็จ " + ti.ID + " " + expense.Description),
				})
			}
		}

		// customers
		if len(ti.Customers) > 0 {
			for i := range ti.Customers {
				ti.Customers[i].InvoiceID = ti.ID
			}

			if len(ti.Customers) > 0 {
				if err := tx.Create(&ti.Customers).Error; err != nil {
					return err
				}
			}

			customerIDs := make([]string, 0)

			for _, customer := range ti.Customers {
				if customer.Status == "paid" {
					customerIDs = append(customerIDs, customer.CustomerID)
				}
			}

			partyMap := make(map[string]string)

			if len(customerIDs) > 0 {
				var parties []partyDomain.Party

				if err := tx.
					Select("id", "name").
					Where("id IN ?", customerIDs).
					Find(&parties).Error; err != nil {
					return err
				}

				for _, p := range parties {
					partyMap[p.ID] = p.Name
				}
			}

			for _, customer := range ti.Customers {
				if customer.Status != "paid" {
					continue
				}

				t = append(t, transaction.Transaction{
					ID:         uuid.NewString(),
					InvoiceID:  &ti.ID,
					Amount:     customer.Total(),
					OccurredAt: ti.CreatedAt,
					Type:       "income",
					Category:   ptr.String("ค่าบรรทุกปลา"),
					Note: ptr.String(
						"ใบเสร็จ " + ti.ID +
							" ลูกค้า " + partyMap[customer.CustomerID],
					),
				})
			}
		}

		if err := tx.Create(&t).Error; err != nil {
			return err
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

func (r *TruckInvoiceRepository) FindOne(id string) (domain.TruckInvoice, error) {
	var invoice domain.TruckInvoice

	err := r.db.
		Preload("Customers").
		Preload("Customers.Customer").
		Preload("Customers.Items").
		Preload("Helpers").
		Preload("OtherExpenses").
		Where("id = ?", id).
		First(&invoice).
		Error

	return invoice, err
}
