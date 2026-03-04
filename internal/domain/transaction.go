package domain

import "time"

type Transaction struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	Type       string    `json:"type"`
	Amount     float64   `json:"amount"`
	OccurredAt time.Time `json:"occurredAt"`
	Category   *string   `json:"category,omitempty"`
	Note       *string   `json:"note,omitempty"`
}
