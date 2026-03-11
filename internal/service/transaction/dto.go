package transaction

import "time"

type CreateTransactionInput struct {
	OccurredAt time.Time `json:"occurredAt"`
	Type       string    `json:"type"`
	Amount     float64   `json:"amount"`
	Category   *string   `json:"category"`
	Note       *string   `json:"note"`
}
