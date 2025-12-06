# 🚀 Q-Downloader Pro - All-in-One Download Manager

**The Ultimate Download Solution** - Download videos, torrents, files, and more from 1000+ platforms, all in your browser!

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 📹 **Video Downloads**
- Download from **1000+ platforms** including:
  - YouTube (all qualities: 360p - 8K)
  - Instagram (Posts, Reels, Stories, IGTV)
  - TikTok
  - Facebook
  - Twitter
  - Vimeo
  - Reddit
  - And many more!
- Multiple quality options
- Audio extraction (MP3)
- Subtitle downloads
- Direct download & converter options

### 🧲 **Torrent Downloads**
- **Browser-based P2P** using WebTorrent
- Magnet link support
- .torrent file uploads
- Real-time progress tracking
- Peer statistics
- Individual file downloads from torrents
- **No software installation needed!**

### ⚡ **Direct File Downloads**
- Any HTTP/HTTPS file
- Progress tracking
- Speed monitoring
- File size detection
- All file types supported

### 📝 **Batch Processing**
- Download multiple files at once
- Paste one URL per line
- Mixed types support (videos, torrents, files)
- Real-time status tracking
- Success/failure statistics

### 📜 **Download History**
- Automatic history tracking
- Export history as JSON
- Clear history option
- Timestamp logging
- Download type categorization

## 🎨 Design

- **Glassmorphism UI** - Modern, premium design
- **Fully Responsive** - Works on all devices
- **Dark Mode** - Easy on the eyes
- **Smooth Animations** - Professional feel
- **Tab-based Interface** - Easy navigation

## 🚀 Getting Started

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/VKrDownloader.git
   cd VKrDownloader
   ```

2. **Open the new version:**
   ```bash
   # Start a local server
   python -m http.server 8000
   
   # Or use any local server
   ```

3. **Navigate to:**
   ```
   http://localhost:8000/index-v2.html
   ```

### Files Structure

```
VKrDownloader-main/
├── index-v2.html      # New all-in-one interface
├── style-v2.css       # Premium styling
├── app-v2.js          # Main application logic
├── index.html         # Original version (still works)
├── style.css          # Original styles
├── javascript.js      # Original scripts
└── README-v2.md       # This file
```

## 📖 Usage Guide

### Video Downloads
1. Click the **Video** tab
2. Paste any video URL
3. Click "Get Download Links"
4. Select your preferred quality/format
5. Click "Download"

### Torrent Downloads
1. Click the **Torrent** tab
2. Paste a magnet link OR upload a .torrent file
3. Click "Start Torrent"
4. Wait for peers to connect
5. Download individual files or the entire torrent

### Direct Downloads
1. Click the **Direct** tab
2. Paste any file URL
3. Click "Download File"
4. Monitor progress
5. File saves automatically

### Batch Downloads
1. Click the **Batch** tab
2. Paste multiple URLs (one per line)
3. Can mix videos, torrents, and files
4. Click "Process All URLs"
5. Monitor each download's status

### History
1. Click the **History** tab
2. View all past downloads
3. Export history as JSON
4. Clear history if needed

## 🛠️ Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with glassmorphism
- **Vanilla JavaScript** - Core logic
- **jQuery** - AJAX requests
- **WebTorrent** - Browser-based torrenting
- **DOMPurify** - XSS protection
- **LocalStorage** - History persistence

## 🔧 API Integration

### Video Downloads
Uses the VKRDownloader API:
```javascript
https://vkrdownloader.org/server?api_key=vkrdownloader&vkr={URL}
```

### Torrent Downloads
Uses WebTorrent for P2P connections:
```javascript
const client = new WebTorrent();
client.add(magnetURI, callback);
```

### Direct Downloads
Uses native Fetch API with progress tracking:
```javascript
fetch(url).then(response => response.body.getReader())
```

## 🌟 Supported Platforms

### Video Platforms (1000+)
- YouTube, YouTube Music
- Instagram, Facebook, Twitter
- TikTok, Snapchat
- Vimeo, Dailymotion
- Reddit, Imgur
- Twitch, Mixer
- And 1000+ more via yt-dlp backend

### File Hosts
- Google Drive
- Dropbox
- OneDrive
- Mega.nz
- MediaFire
- WeTransfer
- Any direct HTTP/HTTPS link

### Torrent Support
- Any magnet link
- Any .torrent file
- Public & private trackers
- DHT support

## 🔐 Privacy & Security

- ✅ **No logging** - Your URLs are not stored on our servers
- ✅ **Client-side processing** - Most operations happen in your browser
- ✅ **No tracking** - We don't track your downloads
- ✅ **XSS Protection** - DOMPurify sanitizes all content
- ✅ **HTTPS** - Secure connections

## 📱 Progressive Web App (PWA)

The app is installable as a PWA:
- Install on desktop
- Install on mobile
- Works offline (cached files)
- Native app feel

## 🎯 Roadmap

### Version 2.1 (Coming Soon)
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Playlist/Channel downloads
- [ ] Format conversion (FFmpeg integration)
- [ ] Browser extension
- [ ] Download scheduler

### Version 2.2 (Future)
- [ ] Document downloads (Scribd, SlideShare)
- [ ] Image gallery downloads (Pinterest, Imgur)
- [ ] Audio platform support (SoundCloud, Bandcamp)
- [ ] Advanced torrent search
- [ ] Multi-language support

### Version 3.0 (Long-term)
- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)
- [ ] Premium features
- [ ] Cloud sync
- [ ] Advanced analytics

## 🐛 Known Issues

1. **WebTorrent Performance** - Large torrents may be slow in browser
2. **CORS Limitations** - Some direct downloads may fail due to CORS
3. **Mobile Torrent** - Limited performance on mobile devices
4. **Safari Compatibility** - WebTorrent may have issues on Safari

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Vijay Kumar**  
Powered by The QUBO Company

## 🙏 Credits

- WebTorrent by Feross Aboukhadijeh
- DOMPurify by Cure53
- VKRDownloader API
- Icons from Feather Icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/VKrDownloader/issues)
- **Email**: support@example.com
- **Website**: https://q-downloader.example.com

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---

**Made with ❤️ by The QUBO Company**
