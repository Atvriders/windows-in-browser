# Windows 10 in Browser (Docker)

Runs Windows 10 in a QEMU/KVM virtual machine inside Docker, accessible via a browser using noVNC.

## Requirements

- Docker & Docker Compose
- KVM support on the host (`/dev/kvm` must exist)
- At least 4GB free RAM and 64GB disk space

## Check KVM availability

```bash
ls -la /dev/kvm
```

If missing, check if your CPU supports virtualization:

```bash
grep -Ec '(vmx|svm)' /proc/cpuinfo
# Should return > 0
```

## Usage

```bash
# Start
docker compose up -d

# Watch logs / installation progress
docker logs -f windows

# Stop
docker compose down
```

## Access

- **Browser (noVNC):** http://localhost:8006
- **RDP client:** localhost:3389

Windows will be downloaded and installed automatically on first run. This takes 10–30 minutes depending on your connection and hardware.

## Configuration

Edit `docker-compose.yml` to adjust:

| Variable     | Default | Description                        |
|--------------|---------|------------------------------------|
| `VERSION`    | `10`    | Windows version (10, 11, 2019, 2022) |
| `RAM_SIZE`   | `4G`    | RAM allocated to VM                |
| `CPU_CORES`  | `2`     | vCPU count                         |
| `DISK_SIZE`  | `64G`   | Virtual disk size                  |
