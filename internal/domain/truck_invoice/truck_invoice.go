package truckinvoice

import (
	"fish/internal/domain/common"
	invoiceDomain "fish/internal/domain/invoice"
)

type TruckInvoice struct {
	invoiceDomain.BaseInvoice
	CarPlate      string              `json:"carPlate"`
	DriverName    string              `json:"driverName"`
	DriverWage    common.Money              `json:"driverWage"`
	Helpers       []HelperWage        `json:"helpers" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`
	OtherExpenses []OtherExpense      `json:"otherExpenses" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`
	Customers     []CustomerContainer `json:"customers" gorm:"foreignKey:InvoiceId;constraint:OnDelete:CASCADE"`

	TotalExpense common.Money  `json:"totalExpense" gorm:"default:0"`
	TotalIncome  common.Money  `json:"totalIncome" gorm:"default:0"`
}
