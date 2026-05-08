package updater

import (
	"encoding/json"
	"fish/internal/buildinfo"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/Masterminds/semver/v3"
)

const RepoAPI = "https://api.github.com/repos/Nonzxense/fish-erp/releases/latest"
const RepoDownload = "https://github.com/Nonzxense/fish-erp/releases/download"

type GithubRelease struct {
	TagName string `json:"tag_name"`
}

type UpdateInfo struct {
	Available bool   `json:"available"`
	Current   string `json:"current"`
	Latest    string `json:"latest"`
	URL       string `json:"url"`
}

func CheckForUpdates() (*UpdateInfo, error) {
	resp, err := http.Get(RepoAPI)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api returned: %s", resp.Status)
	}

	var release GithubRelease

	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, err
	}

	available := IsUpdateAvailable(buildinfo.Version, release.TagName)

	return &UpdateInfo{
		Available: available,
		Current:   buildinfo.Version,
		Latest:    release.TagName,
		URL:       RepoDownload + "/" + release.TagName + "/fish.exe",
	}, nil
}

func IsUpdateAvailable(current, latest string) bool {
	c, _ := semver.NewVersion(strings.TrimPrefix(current, "v"))
	l, _ := semver.NewVersion(strings.TrimPrefix(latest, "v"))

	return l.GreaterThan(c)
}

func DownloadUpdate(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}

	exeDir := filepath.Dir(exePath)

	newExePath := filepath.Join(exeDir, "fish-new.exe")

	out, err := os.Create(newExePath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}

	return newExePath, nil
}

func RunUpdate(newExePath string) error {
	currentExePath, err := os.Executable()
	if err != nil {
		return err
	}

	exeDir := filepath.Dir(currentExePath)

	updaterPath := filepath.Join(exeDir, "updater.exe")

	cmd := exec.Command(
		updaterPath,
		currentExePath,
		newExePath,
	)

	err = cmd.Start()
	if err != nil {
		return err
	}

	os.Exit(0)

	return nil
}
