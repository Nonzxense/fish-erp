package truckinvoice

import (
	"time"
)

type CreateTruckInvoiceInput struct {
	OccurredAt time.Time `json:"occurredAt"`
	Type       string    `json:"type"`
	Status     string    `json:"status"`
	CarPlate   string    `json:"carPlate"`
	DriverName string    `json:"driverName"`
	DriverWage float64   `json:"driverWage" validate:"gte=0"`
	Note       *string   `json:"note"`

	Helpers       []HelperWageInput        `json:"helpers"`
	OtherExpenses []OtherExpenseInput      `json:"otherExpenses"`
	Customers     []CustomerContainerInput `json:"customers"`
}

type HelperWageInput struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount" validate:"gte=0"`
}

type OtherExpenseInput struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount" validate:"gte=0"`
}

type CustomerContainerInput struct {
	CustomerID string `json:"customerId"`
	Status     string `json:"status" validate:"oneof=pending paid"`
	PaidAmount float64
	Items      []ItemInput `json:"items" validate:"dive"`
}

type ItemInput struct {
	Type  string  `json:"type" validate:"required"`
	Qty   int32   `json:"qty" validate:"gte=0"`
	Price float64 `json:"price" validate:"gte=0"`
}
