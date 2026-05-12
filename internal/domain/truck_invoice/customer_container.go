package truckinvoice

import (
	"database/sql/driver"
	"encoding/json"
	"fish/internal/domain/common"
	"fish/internal/domain/party"
	"fmt"
)

type CustomerContainer struct {
	ID uint `gorm:"primaryKey"`

	Status string `json:"status" gorm:"type:text;check:status IN ('pending','paid')"`

	CustomerID string      `json:"customerId"`
	Customer   party.Party `json:"customer" gorm:"foreignKey:CustomerID"`

	InvoiceID string `gorm:"not null"`

	Items []CustomerContainerItem `json:"items" gorm:"foreignKey:ContainerID;constraint:OnDelete:CASCADE"`

	TotalAmount common.Money `json:"totalAmount" gorm:"default:0"`
}

type CustomerContainerItem struct {
	ID          uint `gorm:"primaryKey"`
	ContainerID uint

	Type  string `gorm:"type:text"` // "plastic-l", "plastic-s", "foam-m", etc.
	Qty   int32
	Price common.Money
}

func (c CustomerContainerItem) Value() (driver.Value, error) {
	return json.Marshal(c)
}

func (c *CustomerContainerItem) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan CustomerContainerItem")
	}
	return json.Unmarshal(bytes, c)
}

func (c CustomerContainer) Total() common.Money {
	var total common.Money

	for _, item := range c.Items {
		if item.Qty <= 0 || item.Price <= 0 {
			continue
		}
		total += item.Price.Mul(item.Qty)
	}

	return total
}
