package invoice

import (
	"fish/internal/service/container"
	"time"
)

type CreateInvoiceInput struct {
	Type      string    `json:"type" validate:"required,oneof=sale purchase truck"`
	Status    string    `json:"status" validate:"oneof=pending paid"`
	Note      *string   `json:"note"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateFishSaleInvoiceInput struct {
	CreateInvoiceInput
	CustomerID      string                               `json:"customerId" validate:"required_if=IsNewCustomer false"`
	IsNewCustomer   bool                                 `json:"isNewCustomer"`
	NewCustomerName *string                              `json:"newCustomerName" validate:"omitempty,required_if=IsNewCustomer true"`
	Items           []container.CreateFishContainerInput `json:"items" validate:"required,dive"`
	TotalAmount     float64                              `json:"totalAmount" validate:"required,min=0"`
}
