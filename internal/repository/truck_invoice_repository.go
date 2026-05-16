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
				len(ti.ShippingInvoices),
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

		// shipping invoices
		if len(ti.ShippingInvoices) > 0 {
			for i := range ti.ShippingInvoices {
				ti.ShippingInvoices[i].InvoiceID = ti.ID
			}

			if len(ti.ShippingInvoices) > 0 {
				if err := tx.Create(&ti.ShippingInvoices).Error; err != nil {
					return err
				}
			}

			customerIDs := make([]string, 0)

			for _, si := range ti.ShippingInvoices {
				if si.Status == "paid" {
					customerIDs = append(customerIDs, si.CustomerID)
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

func (r *TruckInvoiceRepository) Update(id string, newInvoice *domain.TruckInvoice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var oldInvoice domain.TruckInvoice

		if err := tx.
			Preload("Customers").
			Preload("Customers.Items").
			Preload("Helpers").
			Preload("OtherExpenses").
			First(&oldInvoice, "id = ?", id).Error; err != nil {
			return err
		}

		newHelperMap := make(map[uint]bool, len(newInvoice.Helpers))
		newExpenseMap := make(map[uint]bool, len(newInvoice.OtherExpenses))

		for _, helper := range newInvoice.Helpers {
			if helper.ID != 0 {
				newHelperMap[helper.ID] = true
			}
		}

		for _, expense := range newInvoice.OtherExpenses {
			if expense.ID != 0 {
				newExpenseMap[expense.ID] = true
			}
		}

		// delete removed helpers
		for _, helper := range oldInvoice.Helpers {
			if !newHelperMap[helper.ID] {
				if err := tx.Delete(&helper).Error; err != nil {
					return err
				}
			}
		}

		// delete removed expenses
		for _, expense := range oldInvoice.OtherExpenses {
			if !newExpenseMap[expense.ID] {
				if err := tx.Delete(&expense).Error; err != nil {
					return err
				}
			}
		}

		t := make([]transaction.Transaction, 0,
			len(newInvoice.Helpers)+
				len(newInvoice.OtherExpenses)+
				len(newInvoice.ShippingInvoices),
		)

		// helpers
		for i := range newInvoice.Helpers {
			helper := &newInvoice.Helpers[i]
			helper.InvoiceID = newInvoice.ID

			if helper.ID == 0 {
				// create new helper
				if err := tx.Create(helper).Error; err != nil {
					return err
				}
			} else {
				// update existing helper
				if err := tx.Model(helper).
					Where("id = ?", helper.ID).
					Updates(map[string]any{
						"name":   helper.Name,
						"amount": helper.Amount,
					}).Error; err != nil {
					return err
				}
			}

			t = append(t, transaction.Transaction{
				ID:         uuid.NewString(),
				InvoiceID:  &newInvoice.ID,
				Amount:     helper.Amount,
				OccurredAt: newInvoice.CreatedAt,
				Type:       "expense",
				Category:   ptr.String("ค่าจ้างเด็กรถ"),
				Note:       ptr.String("ใบเสร็จ " + newInvoice.ID + " เด็กรถ " + helper.Name),
			})
		}

		// expenses
		for i := range newInvoice.OtherExpenses {
			expense := &newInvoice.OtherExpenses[i]
			expense.InvoiceID = newInvoice.ID

			if expense.ID == 0 {
				// create new expense
				if err := tx.Create(expense).Error; err != nil {
					return err
				}
			} else {
				// update existing expense
				if err := tx.Model(expense).
					Where("id = ?", expense.ID).
					Updates(map[string]any{
						"description": expense.Description,
						"amount":      expense.Amount,
					}).Error; err != nil {
					return err
				}
			}

			t = append(t, transaction.Transaction{
				ID:         uuid.NewString(),
				InvoiceID:  &newInvoice.ID,
				Amount:     expense.Amount,
				OccurredAt: newInvoice.CreatedAt,
				Type:       "expense",
				Category:   ptr.String("ค่าใช้จ่ายรถบรรทุก"),
				Note:       ptr.String("ใบเสร็จ " + newInvoice.ID + " " + expense.Description),
			})
		}

		return nil
	})
}
