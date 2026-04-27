package invoice

import "time"

type BaseInvoice struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`
	Type      string    `json:"type" gorm:"type:text;check:type IN ('sale', 'purchase', 'truck')"`
	Status    string    `json:"status" gorm:"type:text;check:status IN ('pending', 'paid', 'cancelled')"`
	Note      *string   `json:"note"`
}
