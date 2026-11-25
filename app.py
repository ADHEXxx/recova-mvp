"""Arranca el servidor de desarrollo de Recova (Next.js).

Uso:
    python app.py

Presioná Ctrl+C para detenerlo.
"""

import argparse
import os
import socket
import subprocess
import sys
from pathlib import Path

PORT = 3210
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))


def lan_address() -> str:
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
        # Choose the interface for the default route without sending a packet.
        connection.connect(("192.0.2.1", 80))
        return connection.getsockname()[0]


def main() -> None:
    parser = argparse.ArgumentParser(description="Inicia Recova y genera un QR para la red local.")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--lan-ip", type=socket.inet_aton, metavar="IPV4")
    parser.add_argument("--qr-only", action="store_true", help="Genera el QR para un servidor ya iniciado.")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("El puerto debe estar entre 1 y 65535.")

    try:
        host = socket.inet_ntoa(args.lan_ip) if args.lan_ip else lan_address()
    except OSError:
        parser.error("No se pudo detectar la IP local. Indicála con --lan-ip.")
    url = f"http://{host}:{args.port}"
    qr_path = Path(ROOT_DIR) / "output" / "recova-qr.png"
    qr_path.parent.mkdir(exist_ok=True)
    render_qr = """
        const qrcode = require("qrcode");
        const [filename, url] = process.argv.slice(1);
        qrcode.toFile(filename, url, { width: 480 }).catch((error) => {
            console.error(error.message);
            process.exitCode = 1;
        });
    """
    subprocess.run(
        ["node", "-e", render_qr, str(qr_path), url],
        cwd=ROOT_DIR,
        check=True,
    )
    print(f"Escaneá el QR desde un celular conectado a la misma red: {qr_path}", flush=True)
    print(f"Dirección de red: {url}", flush=True)
    if args.qr_only:
        return

    cmd = f"npm run dev -- --hostname 0.0.0.0 --port {args.port}"
    print(f"Iniciando Recova en http://localhost:{args.port} ...")
    print("Presioná Ctrl+C para detenerlo.\n")

    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    proc = subprocess.Popen(cmd, cwd=ROOT_DIR, shell=True, creationflags=creationflags)

    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor...")
        if os.name == "nt":
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)])
        else:
            proc.terminate()
            proc.wait()
        print("Servidor detenido.")
        sys.exit(0)


if __name__ == "__main__":
    main()
