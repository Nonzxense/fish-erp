package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("usage: updater.exe <oldExe> <newExe>")
		return
	}

	oldExe := os.Args[1]
	newExe := os.Args[2]

	err := os.Remove(oldExe)
	if err != nil {
		fmt.Println("remove error:", err)
		return
	}

	err = os.Rename(newExe, oldExe)
	if err != nil {
		fmt.Println("rename error:", err)
		return
	}

	absPath, err := filepath.Abs(oldExe)
	if err != nil {
		fmt.Println("abs path error:", err)
		return
	}

	err = exec.Command(absPath).Start()
	if err != nil {
		fmt.Println("start error:", err)
		return
	}
}
