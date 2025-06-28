import qrcode

url = "https://jaemin-lab.ddns.net/"
qr = qrcode.make(url)
qr.save("url_qr.png")

play_store_url = (
    "https://play.google.com/store/apps/details?id=com.jaeminson.etfpercentile"
)
qr = qrcode.make(play_store_url)
qr.save("android_app_qr.png")
