package repository

import "gorm.io/gorm"

func countQuery(query *gorm.DB, total *int64) error {
	return query.Count(total).Error
}
