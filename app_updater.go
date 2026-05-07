package main

import "fish/internal/updater"

func (a *App) CheckForUpdates() (*updater.UpdateInfo, error) {
	return updater.CheckForUpdates()
}

func (a *App) DownloadUpdate(url string) (string, error) {
	return updater.DownloadUpdate(url)
}

func (a *App) RunUpdate(newExePath string) {
	updater.RunUpdate(newExePath)
}