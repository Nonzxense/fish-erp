package party

type PartyFilter struct {
	Name     *string `json:"name"`
	Type     *string `json:"type"`
	Phone    *string `json:"phone"`
	Page     int     `json:"page"`
	PageSize int     `json:"pageSize"`
}
