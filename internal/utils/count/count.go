package count

import (
	"time"

	"gorm.io/gorm"
)

func GetCountForMonth[T any](db *gorm.DB, date time.Time) (int64, error) {
	var count int64

	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return 0, err
	}

	localDate := date.In(loc)

	firstOfMonthLocal := time.Date(localDate.Year(), localDate.Month(), 1, 0, 0, 0, 0, loc)

	nextMonthLocal := firstOfMonthLocal.AddDate(0, 1, 0)

	startUTC := firstOfMonthLocal.UTC()
	endUTC := nextMonthLocal.UTC()

	err = db.Model(new(T)).
		Where("created_at >= ? AND created_at < ?", startUTC, endUTC).
		Count(&count).Error

	return count, err
}
