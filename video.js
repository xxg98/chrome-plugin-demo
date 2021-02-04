(() => (t, e) => {
    function a(t, e, a) {
        if (e in t) {
            Object.defineProperty(t, e, {value: a, enumerable: true, configurable: true, writable: true})
        } else {
            t[e] = a
        }
        return t
    }

    const {getFriendlyTitle: s} = e.import("title");
    const {VideoInfo: i, DanmakuInfo: n, JsonDanmaku: o} = e.import("video-info");
    const {DownloadPackage: r} = e.import("download-package");

    class l {
        async getApiGenerator(t = false) {
            function e(e, a, s) {
                if (t) {
                    if (s) {
                        return `https://api.bilibili.com/x/player/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&fourk=1&fnver=0&fnval=80`
                    } else {
                        return `https://api.bilibili.com/x/player/playurl?avid=${e}&cid=${a}&otype=json&fourk=1&fnver=0&fnval=80`
                    }
                } else {
                    if (s) {
                        return `https://api.bilibili.com/x/player/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&fourk=1&fnver=0&fnval=0`
                    } else {
                        return `https://api.bilibili.com/x/player/playurl?avid=${e}&cid=${a}&otype=json&fourk=1&fnver=0&fnval=0`
                    }
                }
            }

            return e.bind(this)
        }

        async getDashUrl(t) {
            return (await this.getApiGenerator(true))(u.aid, u.cid, t)
        }

        async getUrl(t) {
            return (await this.getApiGenerator())(u.aid, u.cid, t)
        }
    }

    class c extends l {
        async getApiGenerator(t = false) {
            function e(e, a, s) {
                if (t) {
                    if (s) {
                        return `https://api.bilibili.com/pgc/player/web/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&fourk=1&fnval=16`
                    } else {
                        return `https://api.bilibili.com/pgc/player/web/playurl?avid=${e}&cid=${a}&otype=json&fourk=1&fnval=16`
                    }
                } else {
                    if (s) {
                        return `https://api.bilibili.com/pgc/player/web/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&fourk=1&fnver=0&fnval=0`
                    } else {
                        return `https://api.bilibili.com/pgc/player/web/playurl?avid=${e}&cid=${a}&qn=&otype=json&fourk=1&fnver=0&fnval=0`
                    }
                }
            }

            return e.bind(this)
        }
    }

    class d extends l {
        constructor(t) {
            super();
            this.ep = t
        }

        async getApiGenerator(t = false) {
            function e(e, a, s) {
                if (t) {
                    if (s) {
                        return `https://api.bilibili.com/pugv/player/web/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&ep_id=${this.ep}&fnver=0&fnval=16`
                    } else {
                        return `https://api.bilibili.com/pugv/player/web/playurl?avid=${e}&cid=${a}&otype=json&ep_id=${this.ep}&fnver=0&fnval=16`
                    }
                } else {
                    if (s) {
                        return `https://api.bilibili.com/pugv/player/web/playurl?avid=${e}&cid=${a}&qn=${s}&otype=json&ep_id=${this.ep}`
                    } else {
                        return `https://api.bilibili.com/pugv/player/web/playurl?avid=${e}&cid=${a}&otype=json&ep_id=${this.ep}`
                    }
                }
            }

            return e.bind(this)
        }
    }

    const u = {entity: new l, aid: "", cid: ""};
    let h = [];
    let p = null;

    class f {
        constructor(t, e, s) {
            a(this, "quality", void 0);
            a(this, "internalName", void 0);
            a(this, "displayName", void 0);
            this.quality = t;
            this.internalName = e;
            this.displayName = s
        }

        async downloadInfo(t = false) {
            const e = new g(this);
            await e.fetchVideoInfo(t);
            return e
        }

        static parseFormats(t) {
            const e = t.accept_quality;
            const a = t.accept_format.split(",");
            const s = t.accept_description;
            const i = e.map(((t, e) => new f(t, a[e], s[e])));
            return i
        }

        static async filterFormats(t) {
            return t
        }

        static async getAvailableDashFormats() {
            const t = await u.entity.getDashUrl();
            const e = await Ajax.getJsonWithCredentials(t);
            if (e.code !== 0) {
                throw new Error("获取清晰度信息失败.")
            }
            const a = e.data || e.result || e;
            return await f.filterFormats(f.parseFormats(a))
        }

        static async getAvailableFormats() {
            const {BannedResponse: t, throwBannedError: a} = await e.importAsync("batch-warning");
            try {
                const t = await u.entity.getUrl();
                const e = await Ajax.getJsonWithCredentials(t);
                if (e.code !== 0) {
                    throw new Error("获取清晰度信息失败.")
                }
                const a = e.data || e.result || e;
                return await f.filterFormats(f.parseFormats(a))
            } catch (e) {
                if (e.message.includes(t.toString())) {
                    a()
                }
                throw e
            }
        }
    }

    const m = [new f(125, "HDR", "真彩 HDR"), new f(120, "4K", "超清 4K"), new f(116, "1080P60", "高清 1080P60"), new f(112, "1080P+", "高清 1080P+"), new f(80, "1080P", "高清 1080P"), new f(74, "720P60", "高清 720P60"), new f(64, "720P", "高清 720P"), new f(32, "480P", "清晰 480P"), new f(16, "360P", "流畅 360P")];
    const w = async (t, a, s) => {
        if (t === "无") {
            return null
        }
        if (t === "XML") {
            const t = await new n(s).fetchInfo();
            return t.rawXML
        }
        const i = await new o(a, s).fetchInfo();
        if (t === "JSON") {
            return JSON.stringify(i.jsonDanmakus)
        }
        if (t === "ASS") {
            const {convertToAssFromJson: t} = await e.importAsync("download-danmaku");
            return t(i)
        }
        return null
    };

    class g {
        constructor(t, e) {
            a(this, "format", void 0);
            a(this, "subtitle", false);
            a(this, "fragments", void 0);
            a(this, "fragmentSplitFactor", 6 * 2);
            a(this, "workingXhr", null);
            a(this, "progress", void 0);
            a(this, "progressMap", new Map);
            a(this, "videoSpeed", void 0);
            this.format = t;
            this.fragments = e || [];
            this.videoSpeed = new y(this)
        }

        get danmakuOption() {
            return t.downloadVideoDefaultDanmaku
        }

        get subtitleOption() {
            return t.downloadVideoDefaultSubtitle
        }

        get isDash() {
            return this.fragments.some((t => t.url.includes(".m4s")))
        }

        get totalSize() {
            return this.fragments.map((t => t.size)).reduce(((t, e) => t + e))
        }

        async fetchVideoInfo(t = false) {
            if (!t) {
                const t = await u.entity.getUrl(this.format.quality);
                const a = await Ajax.getTextWithCredentials(t);
                const s = JSON.parse(a.replace(/http:/g, "https:"));
                const i = s.data || s.result || s;
                const n = this.format.quality;
                if (i.quality !== n) {
                    const {throwQualityError: t} = await e.importAsync("quality-errors");
                    t(n)
                }
                const o = i.durl;
                this.fragments = o.map((t => ({length: t.length, size: t.size, url: t.url, backupUrls: t.backup_url})))
            } else {
                const {dashToFragments: t, getDashInfo: a} = await e.importAsync("video-dash");
                const s = await a(await u.entity.getDashUrl(this.format.quality), this.format.quality);
                this.fragments = t(s)
            }
            return this.fragments
        }

        updateProgress() {
            const t = this.progressMap ? [...this.progressMap.values()].reduce(((t, e) => t + e), 0) / this.totalSize : 0;
            if (t > 1 || t < 0) {
                console.error(`[下载视频] 进度异常: ${t}`, this.progressMap.values())
            }
            this.progress && this.progress(t)
        }

        cancelDownload() {
            this.videoSpeed.stopMeasure();
            if (this.workingXhr !== null) {
                this.workingXhr.forEach((t => t.abort()))
            } else {
                logError("Cancel Download Failed: forEach in this.workingXhr not found.")
            }
        }

        downloadFragment(t) {
            const e = [];
            const a = this.isDash ? 4 * 1024 * 1024 : 16 * 1024 * 1024;
            let s;
            if (t.size <= a * 6) {
                s = t.size / this.fragmentSplitFactor
            } else {
                s = a
            }
            let i = 0;
            const n = t => [...this.progressMap.keys()].indexOf(t) + 1;
            while (i < t.size) {
                const a = Math.min(t.size - 1, Math.round(i + s));
                const o = `bytes=${i}-${a}`;
                const r = a - i + 1;
                e.push(new Promise(((e, a) => {
                    const s = new XMLHttpRequest;
                    s.open("GET", t.url);
                    s.responseType = "arraybuffer";
                    s.withCredentials = false;
                    s.addEventListener("progress", (t => {
                        console.log(`[下载视频] 视频片段${n(s)}下载进度: ${t.loaded}/${r} bytes loaded, ${o}`);
                        this.progressMap.set(s, t.loaded);
                        this.updateProgress()
                    }));
                    s.addEventListener("load", (() => {
                        if (("" + s.status)[0] === "2") {
                            console.log(`[下载视频] 视频片段${n(s)}下载完成`);
                            e(s.response)
                        } else {
                            a(`视频片段${n(s)}请求失败, response = ${s.status}`)
                        }
                    }));
                    s.addEventListener("abort", (() => a("canceled")));
                    s.addEventListener("error", (() => {
                        console.error(`[下载视频] 视频片段${n(s)}下载失败: ${o}`);
                        this.progressMap.set(s, 0);
                        this.updateProgress();
                        s.open("GET", t.url);
                        s.setRequestHeader("Range", o);
                        s.send()
                    }));
                    s.setRequestHeader("Range", o);
                    this.progressMap.set(s, 0);
                    s.send();
                    this.workingXhr.push(s)
                })));
                i = Math.round(i + s) + 1
            }
            return Promise.all(e)
        }

        async copyUrl() {
            const t = this.fragments.map((t => t.url)).reduce(((t, e) => t + "\r\n" + e));
            GM.setClipboard(t, "text")
        }

        async showUrl() {
            const t = this.fragments.map((t => `\n<a class="download-link" href="${t.url}">${t.url}</a>\n`)).reduce(((t, e) => t + "\r\n" + e));
            Toast.success(t + `<a class="link" id="copy-link" style="cursor: pointer;margin: 8px 0 0 0;">复制全部</a>`, "显示链接");
            const e = await SpinQuery.select("#copy-link");
            e.addEventListener("click", (async () => {
                await this.copyUrl()
            }))
        }

        async exportIdm() {
            const {toIdmFormat: t} = await e.importAsync("idm-support");
            const a = t([this]);
            const i = await this.downloadDanmaku();
            const n = await this.downloadSubtitle();
            const o = new r;
            o.add(`${s()}.${this.danmakuOption === "ASS" ? "ass" : "xml"}`, i);
            o.add(`${s()}.${this.subtitleOption === "ASS" ? "ass" : "json"}`, n);
            o.add(`${s()}.ef2`, a);
            await o.emit(`${s()}.zip`)
        }

        async exportData(t = false) {
            const e = JSON.stringify([{
                fragments: this.fragments,
                title: s(),
                totalSize: this.fragments.map((t => t.size)).reduce(((t, e) => t + e)),
                referer: document.URL.replace(window.location.search, "")
            }]);
            if (t) {
                GM.setClipboard(e, "text")
            } else {
                const t = new Blob([e], {type: "text/json"});
                const a = await this.downloadDanmaku();
                const i = new r;
                i.add(`${s()}.json`, t);
                i.add(s() + "." + this.danmakuOption.toLowerCase(), a);
                await i.emit(`${s()}.zip`)
            }
        }

        async exportAria2(a = false) {
            const {getNumber: i} = await e.importAsync("get-number");
            if (a) {
                const a = await this.downloadDanmaku();
                const n = await this.downloadSubtitle();
                const o = new r;
                o.add(`${s()}.${this.danmakuOption === "ASS" ? "ass" : "xml"}`, a);
                o.add(`${s()}.${this.subtitleOption === "ASS" ? "ass" : "json"}`, n);
                await o.emit();
                const l = t.aria2RpcOption;
                const c = this.fragments.map(((t, e) => {
                    let a = "";
                    if (this.fragments.length > 1 && !this.isDash) {
                        a = " - " + i(e + 1, this.fragments.length)
                    }
                    const n = [];
                    if (l.secretKey !== "") {
                        n.push(`token:${l.secretKey}`)
                    }
                    n.push([t.url]);
                    n.push({
                        referer: document.URL.replace(window.location.search, ""),
                        "user-agent": UserAgent,
                        out: `${s()}${a}${this.extension(t)}`,
                        split: this.fragmentSplitFactor,
                        dir: l.baseDir + l.dir || undefined,
                        "max-download-limit": l.maxDownloadLimit || undefined
                    });
                    const o = encodeURIComponent(`${s()}${a}`);
                    return {params: n, id: o}
                }));
                const {sendRpc: d} = await e.importAsync("aria2-rpc");
                await d(c)
            } else {
                const t = `\n# Generated by Bilibili Evolved Video Export\n# https://github.com/the1812/Bilibili-Evolved/\n${this.fragments.map(((t, e) => {
                    let a = "";
                    if (this.fragments.length > 1 && !this.isDash) {
                        a = " - " + i(e + 1, this.fragments.length)
                    }
                    return `\n${t.url}\n  referer=${document.URL.replace(window.location.search, "")}\n  user-agent=${UserAgent}\n  out=${s()}${a}${this.extension(t)}\n  split=${this.fragmentSplitFactor}\n`.trim()
                })).join("\n")}\n`.trim();
                const e = new Blob([t], {type: "text/plain"});
                const a = await this.downloadDanmaku();
                const n = await this.downloadSubtitle();
                const o = new r;
                o.add(`${s()}.txt`, e);
                o.add(s() + "." + this.danmakuOption.toLowerCase(), a);
                o.add(s() + "." + this.subtitleOption.toLowerCase(), n);
                await o.emit(`${s()}.zip`)
            }
        }

        extension(t) {
            const e = t || this.fragments[0];
            const a = [".flv", ".mp4"].find((t => e.url.includes(t)));
            if (a) {
                return a
            } else if (e.url.includes(".m4s")) {
                return this.fragments.indexOf(e) === 0 ? ".mp4" : ".m4a"
            } else {
                console.warn("No extension detected.");
                return ".flv"
            }
        }

        async downloadDanmaku() {
            if (this.danmakuOption !== "无") {
                const t = new n(u.cid);
                await t.fetchInfo();
                if (this.danmakuOption === "XML") {
                    return t.rawXML
                } else {
                    const {convertToAss: a} = await e.importAsync("download-danmaku");
                    return a(t.rawXML)
                }
            } else {
                return null
            }
        }

        async downloadSubtitle() {
            if (this.subtitle && this.subtitleOption !== "无") {
                const {getSubtitleConfig: t, getSubtitleList: a} = await e.importAsync("download-subtitle");
                const [s, i] = await t();
                const n = await a(u.aid, u.cid);
                const o = n.find((t => t.language === i)) || n[0];
                const r = await Ajax.getJson(o.url);
                const l = r.body;
                if (this.subtitleOption === "JSON") {
                    return l
                } else {
                    const {SubtitleConverter: t} = await e.importAsync("subtitle-converter");
                    const a = new t(s);
                    const i = await a.convertToAss(l);
                    return i
                }
            }
            return null
        }

        async download() {
            this.workingXhr = [];
            this.progressMap = new Map;
            this.updateProgress();
            const t = [];
            this.videoSpeed.startMeasure();
            for (const e of this.fragments) {
                const a = await this.downloadFragment(e);
                t.push(a)
            }
            if (t.length < 1) {
                throw new Error("下载失败.")
            }
            const a = s();
            const i = new r;
            const {getNumber: n} = await e.importAsync("get-number");
            t.forEach(((e, s) => {
                let o;
                const r = this.fragments[s];
                if (t.length > 1 && !this.isDash) {
                    o = `${a} - ${n(s + 1, t.length)}${this.extension(r)}`
                } else {
                    o = `${a}${this.extension(r)}`
                }
                i.add(o, new Blob(Array.isArray(e) ? e : [e]))
            }));
            const o = await this.downloadDanmaku();
            i.add(`${s()}.${this.danmakuOption === "ASS" ? "ass" : "xml"}`, o);
            const l = await this.downloadSubtitle();
            i.add(`${s()}.${this.subtitleOption === "ASS" ? "ass" : "json"}`, l);
            await i.emit(a + ".zip");
            this.progress && this.progress(0);
            this.videoSpeed.stopMeasure()
        }
    }

    class y {
        constructor(t) {
            a(this, "workingDownloader", void 0);
            a(this, "lastProgress", 0);
            a(this, "measureInterval", 1e3);
            a(this, "intervalTimer", void 0);
            a(this, "speedUpdate", void 0);
            this.workingDownloader = t
        }

        startMeasure() {
            this.intervalTimer = window.setInterval((() => {
                const t = this.workingDownloader.progressMap ? [...this.workingDownloader.progressMap.values()].reduce(((t, e) => t + e), 0) : 0;
                const e = t - this.lastProgress;
                if (this.speedUpdate !== undefined) {
                    this.speedUpdate(formatFileSize(e) + "/s")
                }
                this.lastProgress = t
            }), this.measureInterval)
        }

        stopMeasure() {
            clearInterval(this.intervalTimer)
        }
    }

    async function b() {
        const t = await SpinQuery.select((() => (unsafeWindow || window).aid));
        const e = await SpinQuery.select((() => (unsafeWindow || window).cid));
        if (!(t && e)) {
            return false
        }
        u.aid = t;
        u.cid = e;
        if (document.URL.includes("bangumi")) {
            u.entity = new c
        } else if (document.URL.includes("cheese")) {
            const t = document.URL.match(/cheese\/play\/ep([\d]+)/);
            u.entity = new d(t[1])
        } else {
            u.entity = new l
        }
        try {
            h = await f.getAvailableFormats()
        } catch (t) {
            return false
        }
        return true
    }

    const v = e => {
        const a = t.downloadVideoQuality;
        const s = e.find((t => t.quality === a));
        if (s) {
            return s
        }
        const i = e.filter((t => t.quality < a)).shift();
        if (i) {
            return i
        }
        return e.shift()
    };

    async function k() {
        p = v(h);
        e.applyStyle("downloadVideoStyle");
        const t = dq("#download-video");
        t.addEventListener("click", (() => {
            const t = dq(".download-video");
            t.classList.toggle("opened");
            window.scroll(0, 0);
            dq(".gui-settings-mask").click()
        }));
        t.addEventListener("mouseover", (() => {
            x()
        }), {once: true})
    }

    async function x() {
        let a;
        const o = [{name: "single", displayName: "单个视频"}, {name: "batch", displayName: "批量导出"}, {
            name: "manual",
            displayName: "手动输入"
        }];
        const c = new Vue({
            template: e.import("downloadVideoHtml"),
            components: {
                VDropdown: () => e.importAsync("v-dropdown.vue"),
                VCheckbox: () => e.importAsync("v-checkbox.vue"),
                RpcProfiles: () => e.importAsync("aria2-rpc-profiles.vue")
            },
            data: {
                batch: false,
                subtitle: false,
                selectedTab: o[0],
                coverUrl: EmptyImageUrl,
                aid: u.aid,
                cid: u.cid,
                dashModel: {value: t.downloadVideoFormat, items: ["flv", "dash"]},
                qualityModel: {value: p.displayName, items: h.map((t => t.displayName))},
                manualQualityModel: {value: m[1].displayName, items: m.map((t => t.displayName))},
                danmakuModel: {value: t.downloadVideoDefaultDanmaku, items: ["无", "XML", "JSON", "ASS"]},
                subtitleModel: {value: t.downloadVideoDefaultSubtitle, items: ["无", "JSON", "ASS"]},
                codecModel: {value: t.downloadVideoDashCodec, items: ["AVC/H.264", "HEVC/H.265"]},
                progressPercent: 0,
                size: "获取大小中",
                blobUrl: "",
                lastCheckedEpisodeIndex: -1,
                episodeList: [],
                downloading: false,
                speed: "",
                rpcSettings: t.aria2RpcOption,
                showRpcSettings: false,
                busy: false,
                saveRpcSettingsText: "保存配置",
                enableDash: t.enableDashDownload,
                lastDirectDownloadLink: "",
                manualInputText: ""
            },
            computed: {
                tabs() {
                    if (this.batch) {
                        return o
                    }
                    const t = [...o];
                    _.remove(t, (t => t.name === "batch"));
                    return t
                }, manualInputItems() {
                    const t = this.manualInputText.split(/\s/g);
                    const e = t.map((t => t.match(/av(\d+)/i) || t.match(/^(\d+)$/)));
                    return _.uniq(e.filter((t => t !== null)).map((t => t[1])))
                }, downloadSingle() {
                    return this.selectedTab.name === "single"
                }, displaySize() {
                    if (typeof this.size === "string") {
                        return this.size
                    }
                    return formatFileSize(this.size)
                }, sizeWarning() {
                    if (typeof this.size === "string") {
                        return false
                    }
                    return this.size > 1073741824
                }, selectedEpisodeCount() {
                    return this.episodeList.filter((t => t.checked)).length
                }, dash() {
                    return this.dashModel.value === "dash"
                }
            },
            methods: {
                close() {
                    this.$el.classList.remove("opened")
                }, danmakuOptionChange() {
                    t.downloadVideoDefaultDanmaku = this.danmakuModel.value
                }, subtitleOptionChange() {
                    t.downloadVideoDefaultSubtitle = this.subtitleModel.value
                }, async codecChange() {
                    t.downloadVideoDashCodec = this.codecModel.value;
                    await this.formatChange()
                }, async dashChange() {
                    const e = t.downloadVideoFormat = this.dashModel.value;
                    let a = [];
                    if (e === "flv") {
                        a = await f.getAvailableFormats()
                    } else {
                        a = await f.getAvailableDashFormats()
                    }
                    h = a;
                    p = v(h);
                    this.qualityModel.items = a.map((t => t.displayName));
                    this.qualityModel.value = this.qualityModel.items[h.indexOf(p)];
                    await this.formatChange()
                }, async formatChange(e = false) {
                    const a = this.getFormat();
                    if (e) {
                        t.downloadVideoQuality = a.quality
                    }
                    try {
                        this.size = "获取大小中";
                        const t = await a.downloadInfo(this.dash);
                        this.size = t.totalSize
                    } catch (t) {
                        this.size = "获取大小失败";
                        throw t
                    }
                }, getManualFormat() {
                    let t;
                    t = m.find((t => t.displayName === this.manualQualityModel.value));
                    if (!t) {
                        console.error(`No format found. model value = ${this.manualQualityModel.value}`);
                        return null
                    }
                    return t
                }, getFormat() {
                    let t;
                    t = h.find((t => t.displayName === this.qualityModel.value));
                    if (!t) {
                        console.error(`No format found. model value = ${this.qualityModel.value}`);
                        return null
                    }
                    return t
                }, async exportData(t) {
                    if (this.busy === true) {
                        return
                    }
                    try {
                        this.busy = true;
                        if (this.selectedTab.name === "batch") {
                            await this.exportBatchData(t);
                            return
                        }
                        if (this.selectedTab.name === "manual") {
                            await this.exportManualData(t);
                            return
                        }
                        const a = this.getFormat();
                        const i = await a.downloadInfo(this.dash);
                        i.subtitle = this.subtitle;
                        switch (t) {
                            case"copyLink":
                                await i.copyUrl();
                                Toast.success("已复制链接到剪贴板.", "下载视频", 3e3);
                                break;
                            case"showLink":
                                await i.showUrl();
                                break;
                            case"aria2":
                                await i.exportAria2(false);
                                break;
                            case"aria2RPC":
                                await i.exportAria2(true);
                                break;
                            case"copyVLD":
                                await i.exportData(true);
                                Toast.success("已复制VLD数据到剪贴板.", "下载视频", 3e3);
                                break;
                            case"exportVLD":
                                await i.exportData(false);
                                break;
                            case"ffmpegFragments":
                                if (i.fragments.length < 2) {
                                    Toast.info("当前视频没有分段.", "分段合并", 3e3)
                                } else {
                                    const {getFragmentsList: t} = await e.importAsync("ffmpeg-support");
                                    const a = new r;
                                    a.add("ffmpeg-files.txt", t(i.fragments.length, s(), i.fragments.map((t => i.extension(t)))));
                                    await a.emit()
                                }
                                break;
                            case"idm":
                                await i.exportIdm();
                                break;
                            default:
                                break
                        }
                    } catch (t) {
                        logError(t)
                    } finally {
                        this.busy = false
                    }
                }, async exportBatchData(t) {
                    const a = this.episodeList;
                    const {MaxBatchSize: i, showBatchWarning: o} = await e.importAsync("batch-warning");
                    if (a.every((t => !t.checked))) {
                        Toast.info("请至少选择1集或以上的数量!", "批量导出", 3e3);
                        return
                    }
                    if (a.filter((t => t.checked)).length > i) {
                        o("批量导出");
                        return
                    }
                    const l = t => {
                        const e = a.find((e => e.cid === t.cid));
                        if (e === undefined) {
                            return false
                        }
                        return e.checked
                    };
                    const c = this.batchExtractor;
                    const d = this.getFormat();
                    if (this.danmakuModel.value !== "无") {
                        const t = Toast.info("下载弹幕中...", "批量导出");
                        const s = new r;
                        try {
                            if (this.danmakuModel.value === "XML") {
                                for (const t of a.filter(l)) {
                                    const e = new n(t.cid);
                                    await e.fetchInfo();
                                    s.add(c.formatTitle(t.titleParameters) + ".xml", e.rawXML)
                                }
                            } else {
                                const {convertToAss: t} = await e.importAsync("download-danmaku");
                                for (const e of a.filter(l)) {
                                    const a = new n(e.cid);
                                    await a.fetchInfo();
                                    s.add(c.formatTitle(e.titleParameters) + ".ass", await t(a.rawXML))
                                }
                            }
                            await s.emit(this.cid + ".danmakus.zip")
                        } catch (t) {
                            logError(`弹幕下载失败`);
                            throw t
                        } finally {
                            t.dismiss()
                        }
                    }
                    if (this.subtitleModel.value !== "无") {
                        const t = Toast.info("下载字幕中...", "批量导出");
                        const s = new r;
                        try {
                            const {getSubtitleConfig: i, getSubtitleList: n} = await e.importAsync("download-subtitle");
                            const [o, r] = await i();
                            for (const t of a.filter(l)) {
                                const a = await n(t.aid, t.cid);
                                const i = a.find((t => t.language === r)) || a[0];
                                if (i === undefined) {
                                    continue
                                }
                                const l = await Ajax.getJson(i.url);
                                const d = l.body;
                                if (this.subtitleModel.value === "JSON") {
                                    s.add(c.formatTitle(t.titleParameters) + ".json", d)
                                } else {
                                    const {SubtitleConverter: a} = await e.importAsync("subtitle-converter");
                                    const i = new a(o);
                                    const n = await i.convertToAss(d);
                                    s.add(c.formatTitle(t.titleParameters) + ".ass", n)
                                }
                            }
                            await s.emit(this.cid + ".subtitles.zip")
                        } catch (t) {
                            logError(`字幕下载失败`);
                            throw t
                        } finally {
                            t.dismiss()
                        }
                    }
                    const h = Toast.info("获取链接中...", "批量导出");
                    c.config.itemFilter = l;
                    c.config.api = await u.entity.getApiGenerator(this.dash);
                    let p;
                    try {
                        switch (t) {
                            case"idm":
                                const t = await c.getRawItems(d);
                                const {toIdmFormat: a} = await e.importAsync("idm-support");
                                p = a(t);
                                await r.single(s(false) + ".ef2", new Blob([p], {type: "text/plain"}));
                                return;
                            case"aria2":
                                p = await c.collectAria2(d, h, false);
                                await r.single(s(false) + ".txt", new Blob([p], {type: "text/plain"}));
                                return;
                            case"aria2RPC":
                                await c.collectAria2(d, h, true);
                                Toast.success(`成功发送了批量请求.`, "aria2 RPC", 3e3);
                                return;
                            case"copyVLD":
                                GM.setClipboard(await c.collectData(d, h), {mimetype: "text/plain"});
                                Toast.success("已复制批量vld数据到剪贴板.", "批量导出", 3e3);
                                return;
                            case"exportVLD":
                                p = await c.collectData(d, h);
                                await r.single(s(false) + ".json", new Blob([p], {type: "text/json"}));
                                return;
                            case"ffmpegFragments": {
                                const t = await c.getRawItems(d);
                                if (t.every((t => t.fragments.length < 2))) {
                                    Toast.info("所有选择的分P都没有分段.", "分段列表", 3e3);
                                    return
                                }
                                const a = new g(d, t[0].fragments);
                                const {getBatchFragmentsList: i} = await e.importAsync("ffmpeg-support");
                                const n = i(t, this.dash || a.extension());
                                if (!n) {
                                    Toast.info("所有选择的分P都没有分段.", "分段列表", 3e3);
                                    return
                                }
                                const o = new r;
                                for (const [t, e] of n.entries()) {
                                    o.add(t, e)
                                }
                                await o.emit(escapeFilename(`${s(false)}.zip`))
                            }
                                break;
                            case"ffmpegEpisodes": {
                                const t = await c.getRawItems(d);
                                const a = new g(d, t[0].fragments);
                                const {getBatchEpisodesList: s} = await e.importAsync("ffmpeg-support");
                                const i = s(t, this.dash || a.extension());
                                const n = new r;
                                n.add("ffmpeg-files.txt", i);
                                await n.emit()
                            }
                                break;
                            default:
                                return
                        }
                    } catch (t) {
                        logError(t)
                    } finally {
                        h.dismiss()
                    }
                }, async exportManualData(t) {
                    const {MaxBatchSize: a, showBatchWarning: s} = await e.importAsync("batch-warning");
                    if (this.manualInputItems.length === 0) {
                        Toast.info("请至少输入一个有效的视频链接!", "手动输入", 3e3);
                        return
                    }
                    if (this.manualInputItems.length > a) {
                        s("手动输入");
                        return
                    }
                    const {ManualInputBatch: i} = await e.importAsync("batch-download");
                    const o = new i({api: await (new l).getApiGenerator(this.dash), itemFilter: () => true});
                    o.items = this.manualInputItems;
                    if (this.danmakuModel.value !== "无") {
                        const t = Toast.info("下载弹幕中...", "手动输入");
                        const a = new r;
                        try {
                            if (this.danmakuModel.value === "XML") {
                                for (const t of await o.getItemList()) {
                                    const e = new n(t.cid);
                                    await e.fetchInfo();
                                    a.add(i.formatTitle(t.titleParameters) + ".xml", e.rawXML)
                                }
                            } else {
                                const {convertToAss: t} = await e.importAsync("download-danmaku");
                                for (const e of await o.getItemList()) {
                                    const s = new n(e.cid);
                                    await s.fetchInfo();
                                    a.add(i.formatTitle(e.titleParameters) + ".ass", await t(s.rawXML))
                                }
                            }
                            await a.emit("manual-exports.danmakus.zip")
                        } catch (t) {
                            logError(`弹幕下载失败`);
                            throw t
                        } finally {
                            t.dismiss()
                        }
                    }
                    if (this.subtitleModel.value !== "无") {
                        const t = Toast.info("下载字幕中...", "批量导出");
                        const a = new r;
                        try {
                            const {getSubtitleConfig: s, getSubtitleList: n} = await e.importAsync("download-subtitle");
                            const [r, l] = await s();
                            for (const t of await o.getItemList()) {
                                const s = await n(t.aid, t.cid);
                                const o = s.find((t => t.language === l)) || s[0];
                                const c = await Ajax.getJson(o.url);
                                const d = c.body;
                                if (this.subtitleModel.value === "JSON") {
                                    a.add(i.formatTitle(t.titleParameters) + ".json", d)
                                } else {
                                    const {SubtitleConverter: s} = await e.importAsync("subtitle-converter");
                                    const n = new s(r);
                                    const o = await n.convertToAss(d);
                                    a.add(i.formatTitle(t.titleParameters) + ".ass", o)
                                }
                            }
                            await a.emit("manual-exports.subtitles.zip")
                        } catch (t) {
                            logError(`字幕下载失败`);
                            throw t
                        } finally {
                            t.dismiss()
                        }
                    }
                    const c = Toast.info("获取链接中...", "手动输入");
                    try {
                        switch (t) {
                            default:
                            case"aria2": {
                                const t = await o.collectAria2(this.getManualFormat().quality, false);
                                await r.single("manual-exports.txt", new Blob([t], {type: "text/plain"}));
                                break
                            }
                            case"aria2RPC": {
                                await o.collectAria2(this.getManualFormat().quality, true);
                                Toast.success(`成功发送了批量请求.`, "aria2 RPC", 3e3);
                                break
                            }
                            case"idm": {
                                const t = await o.getRawItems(this.getManualFormat().quality);
                                const {toIdmFormat: a} = await e.importAsync("idm-support");
                                const s = a(t);
                                await r.single("manual-exports.ef2", new Blob([s], {type: "text/plain"}));
                                break
                            }
                        }
                    } catch (t) {
                        logError(t)
                    } finally {
                        c.dismiss()
                    }
                }, async checkBatch() {
                    const t = ["//www.bilibili.com/bangumi", "//www.bilibili.com/video", "//www.bilibili.com/blackboard/bnj2020.html"];
                    if (!t.some((t => document.URL.includes(t)))) {
                        this.batch = false;
                        this.episodeList = [];
                        return
                    }
                    const {BatchExtractor: a} = await e.importAsync("batch-download");
                    const {MaxBatchSize: s} = await e.importAsync("batch-warning");
                    if (await a.test() !== true) {
                        this.batch = false;
                        this.episodeList = [];
                        return
                    }
                    const i = this.batchExtractor = new a;
                    this.batch = true;
                    this.episodeList = (await i.getItemList()).map(((t, e) => ({
                        aid: t.aid,
                        cid: t.cid,
                        title: t.title,
                        titleParameters: t.titleParameters,
                        index: e,
                        checked: e < s
                    })))
                }, async checkSubtitle() {
                    const {getSubtitleList: t} = await e.importAsync("download-subtitle");
                    const a = await t(u.aid, u.cid);
                    this.subtitle = a.length > 0
                }, cancelDownload() {
                    if (a) {
                        a.cancelDownload()
                    }
                }, async startDownload() {
                    const t = this.getFormat();
                    if (t.quality === 120) {
                        Toast.info("4K视频不支持直接下载, 请使用下方的导出选项.", "下载视频", 5e3);
                        return
                    }
                    try {
                        this.downloading = true;
                        const e = await t.downloadInfo(this.dash);
                        e.subtitle = this.subtitle;
                        e.videoSpeed.speedUpdate = t => this.speed = t;
                        e.progress = t => {
                            this.progressPercent = Math.trunc(t * 100)
                        };
                        a = e;
                        await e.download();
                        this.lastDirectDownloadLink = r.lastPackageUrl
                    } catch (t) {
                        if (t !== "canceled") {
                            logError(t)
                        }
                        this.progressPercent = 0
                    } finally {
                        this.downloading = false;
                        this.speed = ""
                    }
                }, selectAllEpisodes() {
                    this.episodeList.forEach((t => t.checked = true))
                }, unselectAllEpisodes() {
                    this.episodeList.forEach((t => t.checked = false))
                }, inverseAllEpisodes() {
                    this.episodeList.forEach((t => t.checked = !t.checked))
                }, shiftToggleEpisodes(t, e) {
                    if (!t.shiftKey || this.lastCheckedEpisodeIndex === -1) {
                        console.log("set lastCheckedEpisodeIndex", e);
                        this.lastCheckedEpisodeIndex = e;
                        return
                    }
                    if (t.shiftKey && this.lastCheckedEpisodeIndex !== -1) {
                        this.episodeList.slice(Math.min(this.lastCheckedEpisodeIndex, e) + 1, Math.max(this.lastCheckedEpisodeIndex, e)).forEach((t => {
                            t.checked = !t.checked
                        }));
                        console.log("shift toggle", Math.min(this.lastCheckedEpisodeIndex, e) + 1, Math.max(this.lastCheckedEpisodeIndex, e));
                        this.lastCheckedEpisodeIndex = e;
                        t.preventDefault()
                    }
                }, toggleRpcSettings() {
                    this.showRpcSettings = !this.showRpcSettings
                }, saveRpcSettings() {
                    if (this.rpcSettings.host === "") {
                        this.rpcSettings.host = "127.0.0.1"
                    }
                    if (this.rpcSettings.port === "") {
                        this.rpcSettings.port = "6800"
                    }
                    t.aria2RpcOption = this.rpcSettings;
                    const e = t.aria2RpcOptionProfiles.find((e => e.name === t.aria2RpcOptionSelectedProfile));
                    if (e) {
                        Object.assign(e, this.rpcSettings);
                        t.aria2RpcOptionProfiles = t.aria2RpcOptionProfiles
                    }
                    this.saveRpcSettingsText = "已保存";
                    setTimeout((() => this.saveRpcSettingsText = "保存配置"), 2e3)
                }, updateProfile(e) {
                    t.aria2RpcOption = this.rpcSettings = _.omit(e, "name")
                }
            },
            async mounted() {
            }
        });
        const d = c.$mount().$el;
        document.body.insertAdjacentElement("beforeend", d);
        Observer.videoChange((async () => {
            c.close();
            c.batch = false;
            c.selectedTab = o[0];
            const t = dq("#download-video");
            const e = await b();
            t.style.display = e ? "flex" : "none";
            if (!e) {
                return
            }
            c.aid = u.aid;
            c.cid = u.cid;
            try {
                const t = new i(u.aid);
                await t.fetchInfo();
                c.coverUrl = t.coverUrl.replace("http:", "https:")
            } catch (t) {
                c.coverUrl = EmptyImageUrl
            }
            c.dashChange();
            c.checkSubtitle();
            await c.checkBatch()
        }))
    }

    return {
        widget: {
            content: `\n<button class="gui-settings-flat-button" style="position: relative; z-index: 100;" id="download-video">\n<i class="icon-download"></i>\n<span>下载视频</span>\n</button>`,
            condition: b,
            success: k
        }
    }
})();