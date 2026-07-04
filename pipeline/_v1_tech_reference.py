                        bb_walk = "down"
        # 前日比(%)
        prev = closes[-2] if len(closes) >= 2 else None
        chg = round((closes[-1] / prev - 1) * 100, 2) if prev else None
        # 売買代金(終値×出来高) 本日 / 1週平均 / 1月平均（百万通貨単位）
        def turnover(c_list, v_list):
            return sum(c * v for c, v in zip(c_list, v_list)) / max(1, len(c_list))
        to_today = closes[-1] * vols[-1] / 1e6
        to_1w = turnover(closes[-5:], vols[-5:]) / 1e6
        to_1m = turnover(closes[-21:], vols[-21:]) / 1e6
        to_1w_ratio = round((to_today / to_1w - 1) * 100, 1) if to_1w else None
        to_1m_ratio = round((to_today / to_1m - 1) * 100, 1) if to_1m else None
        # 回転率(絶対) = 本日出来高 ÷ 発行済株式数（日本株のみ、%）
        turn = None
        mcap = None
        if market == "jp":
            sh = SHARES_JP.get(sym)  # 百万株
            if sh:
                turn = round(vol_today / (sh * 1e6) * 100, 2)  # %
                mcap = round(closes[-1] * sh / 1e3, 1)  # 億円 (株価×百万株/1000... 円×百万株=百万円→億は/100)
                mcap = round(closes[-1] * sh / 100, 0)  # 億円
        # === テクニカル指標(売り場/買い場判定用) ===
        # 25日移動平均と乖離率
        ma25 = sum(closes[-25:]) / min(25, len(closes)) if closes else None
        dev25 = round((closes[-1] / ma25 - 1) * 100, 1) if ma25 else None  # +なら上、-なら押し目
        ma75v = sum(closes[-75:]) / min(75, len(closes)) if closes else None
        ma50v = sum(closes[-50:]) / min(50, len(closes)) if closes else None
        # === パーフェクトオーダー(日足): 5日線>25日線>75日線 で全部上向き ===
        ma5v = sum(closes[-5:]) / min(5, len(closes)) if closes else None
        perfect_order = False       # 強気パーフェクトオーダー
        perfect_order_bear = False  # 弱気(下向き)パーフェクトオーダー
        if len(closes) >= 80 and ma5v and ma25 and ma75v:
            # 各線が上向きか(5日前と比べて上昇)
            ma5_prev = sum(closes[-10:-5]) / 5
            ma25_prev = sum(closes[-30:-5]) / 25
            ma75_prev = sum(closes[-80:-5]) / 75
            up_aligned = (ma5v > ma25 > ma75v)
            up_sloping = (ma5v > ma5_prev and ma25 > ma25_prev and ma75v > ma75_prev)
            if up_aligned and up_sloping:
                perfect_order = True
            down_aligned = (ma5v < ma25 < ma75v)
            down_sloping = (ma5v < ma5_prev and ma25 < ma25_prev and ma75v < ma75_prev)
            if down_aligned and down_sloping:
                perfect_order_bear = True
        # === 押し目(日足): 上昇基調で、各移動平均線に接近/軽く割った=買い場候補 ===
        # 5日線/25日線/75日線それぞれにバッファ(±約3%)を持たせて判定
        dev5v = round((closes[-1] / ma5v - 1) * 100, 1) if ma5v else None   # 5日線乖離
        dev50 = round((closes[-1] / ma50v - 1) * 100, 1) if ma50v else None  # 50日線乖離
        dev75 = round((closes[-1] / ma75v - 1) * 100, 1) if ma75v else None  # 75日線乖離
        pullback = None
        pullback_ma = None  # どの線の押し目か(5/25/50/75)
        # 上昇基調の条件(中期上向き=25日線が75日線より上、または1ヶ月プラス)
        uptrend_base = (ma25 and ma75v and ma25 >= ma75v * 0.99)
        if uptrend_base:
            # 25日線の押し目を最優先(バッファ: -4%〜+2.5%で「線の近く」)
            if dev25 is not None and -4 <= dev25 <= 2.5:
                pullback = "25日線の押し目"
                pullback_ma = 25
            # 50日線の押し目(中期の押し・バッファ -4%〜+3%)
            elif dev50 is not None and -4 <= dev50 <= 3:
                pullback = "50日線の押し目"
                pullback_ma = 50
            # 75日線の押し目(深い押し・バッファ -4%〜+3%)
            elif dev75 is not None and -4 <= dev75 <= 3:
                pullback = "75日線の押し目(深い)"
                pullback_ma = 75
            # 5日線の押し目(浅い押し・短期・バッファ -3%〜+1.5%)
            elif dev5v is not None and -3 <= dev5v <= 1.5:
                pullback = "5日線の押し目(浅い)"
                pullback_ma = 5
        # 1ヶ月(約21営業日)騰落率
        ret1m = round((closes[-1] / closes[-22] - 1) * 100, 1) if len(closes) >= 22 else None
        # 3ヶ月騰落率
        ret3m = round((closes[-1] / closes[-64] - 1) * 100, 1) if len(closes) >= 64 else None
        # RSI(14日)
        rsi = None
        if len(closes) >= 15:
            gains, losses = [], []
            for i in range(-14, 0):
                diff = closes[i] - closes[i-1]
                gains.append(max(diff, 0)); losses.append(max(-diff, 0))
            ag = sum(gains)/14; al = sum(losses)/14
            rsi = round(100 - 100/(1 + ag/al), 0) if al else 100
        # 52週高値からの位置(%)
        hi52 = max(closes[-250:]) if closes else None
        lo52 = min(closes[-250:]) if closes else None
        posPct = round((closes[-1] - lo52) / (hi52 - lo52) * 100, 0) if (hi52 and hi52 != lo52) else None
        # === デイトレ用 超短期指標 ===
        # 5日移動平均と乖離率(短期トレンド)
        ma5 = sum(closes[-5:]) / min(5, len(closes)) if closes else None
        dev5 = round((closes[-1] / ma5 - 1) * 100, 1) if ma5 else None
        # 直近3日・5日リターン
        ret3d = round((closes[-1] / closes[-4] - 1) * 100, 1) if len(closes) >= 4 else None
        ret5d = round((closes[-1] / closes[-6] - 1) * 100, 1) if len(closes) >= 6 else None
        # 連続上昇/下落日数(+n=n日連続上昇, -n=n日連続下落)
        streak = 0
        for i in range(len(closes)-1, 0, -1):
            if closes[i] > closes[i-1]:
                if streak >= 0: streak += 1
                else: break
            elif closes[i] < closes[i-1]:
                if streak <= 0: streak -= 1
                else: break
            else: break
        # 当日の値幅(高安レンジは無いので前日比で代用済み)
        # デイトレ妙味スコア: 出来高急増×当日上昇×短期過熱でない
        daytrade = None
        if vol_ratio is not None and chg is not None:
            if vol_ratio >= 2.0 and chg >= 2.0:
                daytrade = "資金流入急増"   # 今日出来高2倍以上＋上昇
            elif vol_ratio >= 1.5 and 0 < chg < 2.0:
                daytrade = "初動の兆し"
            elif vol_ratio >= 2.0 and chg <= -2.0:
                daytrade = "急落・リバ狙い"
        # シグナル判定
        signal = None
        if dev25 is not None and rsi is not None:
            if dev25 <= -8 and rsi <= 35:
                signal = "押し目"      # 25日線から大きく下＋売られすぎ
            elif dev25 <= -3 and rsi < 45:
                signal = "調整中"
            elif dev25 >= 8 and rsi >= 70:
                signal = "過熱"
            elif abs(dev25) <= 3:
                signal = "25日線付近"
        # === チャートパターン判定 ===
        pattern = None
        if len(closes) >= 60:
            cur = closes[-1]
            ma25v = ma25
            ma75 = sum(closes[-75:]) / min(75, len(closes))
            recent20_hi = max(closes[-20:])
            recent20_lo = min(closes[-20:])
            recent60_hi = max(closes[-60:])
            prior_hi = max(closes[-60:-5]) if len(closes) >= 65 else recent60_hi
            vol_up = (vol_ratio is not None and vol_ratio >= 1.3)

            # 局所ピーク・谷を検出するヘルパー(前後3日より高い/低い点)
            # ＋プロミネンス: 直近の谷(または山)から min_prom 以上離れた「明確な」山谷だけ採用
            def local_peaks(arr, lo=False, min_prom=0.02):
                raw = []
                for i in range(3, len(arr) - 3):
                    win = arr[i-3:i+4]
                    if (not lo and arr[i] == max(win)) or (lo and arr[i] == min(win)):
                        raw.append((i, arr[i]))
                pts = []
                for i, v in raw:
                    left = arr[max(0, i-10):i]
                    right = arr[i+1:i+11]
                    if not left or not right:
                        continue
                    if lo:
                        prom = min(max(left), max(right)) / v - 1  # 谷: 両側の戻り幅
                    else:
                        prom = 1 - max(min(left), min(right)) / v  # 山: 両側の押し幅
                    if prom >= min_prom:
                        pts.append((i, v))
                return pts

            seg = closes[-60:]  # 直近60日でパターンを探す
            seg_hi, seg_lo = max(seg), min(seg)
            peaks = local_peaks(seg, lo=False)
            troughs = local_peaks(seg, lo=True)
            # トレンド判定(パターンの前提条件に使う)
            uptrend = ma25v is not None and cur > ma25v > ma75      # 上昇中
            downtrend = ma25v is not None and cur < ma25v < ma75    # 下降中

            # 三尊(ヘッド&ショルダー天井): 高値3つで真ん中が一番高い→弱気転換
            # 前提: 上昇して天井を付けた形。ヘッドはレンジ上限付近＆下降中には出さない
            santen = False
            if len(peaks) >= 3 and not downtrend:
                last3 = peaks[-3:]
                l, m, r = last3[0][1], last3[1][1], last3[2][1]
                if (m > l and m > r and abs(l - r) / m < 0.06        # 両肩がほぼ同水準
                        and m >= seg_hi * 0.97                        # ヘッド=レンジ天井(上昇の頂点)
                        and seg[0] < m * 0.94):                       # 上昇して入ってきた
                    # ネックライン(両肩間の谷)割れで確定、それ以外は不成立
                    neck_lo = min(seg[last3[0][0]:last3[2][0]+1]) if last3[2][0] > last3[0][0] else None
                    if neck_lo and cur < neck_lo * 1.01:
                        santen = True
            # 逆三尊(ヘッド&ショルダー底): 安値3つで真ん中が一番安い→強気転換
            # 前提: 下落して底を付けた形。ヘッドはレンジ下限付近＆上昇中には出さない
            gyaku = False
            if len(troughs) >= 3 and not uptrend:
                last3 = troughs[-3:]
                l, m, r = last3[0][1], last3[1][1], last3[2][1]
                if (m < l and m < r and abs(l - r) / m < 0.06
                        and m <= seg_lo * 1.03                        # ヘッド=レンジ底(下落の底)
                        and seg[0] > m * 1.06                         # 下落して入ってきた
                        and cur > m * 1.03):                          # 底から反発済み
                    gyaku = True
            # トリプルトップ(高値3つがほぼ同水準=レンジ天井→弱気): レンジ上部でのみ成立
            triple_top = False
            if len(peaks) >= 3 and not santen and not downtrend:
                last3 = [p[1] for p in peaks[-3:]]
                avg = sum(last3) / 3
                if (all(abs(v - avg) / avg < 0.04 for v in last3)
                        and avg >= seg_hi * 0.95 and cur < avg * 0.98):
                    triple_top = True
            # トリプルボトム(安値3つがほぼ同水準=レンジ底→強気): レンジ下部でのみ成立
            triple_bottom = False
            if len(troughs) >= 3 and not gyaku and not uptrend:
                last3 = [t[1] for t in troughs[-3:]]
                avg = sum(last3) / 3
                if (all(abs(v - avg) / avg < 0.04 for v in last3)
                        and avg <= seg_lo * 1.05 and cur > avg * 1.02):
                    triple_bottom = True
            # ダブルトップ(高値2つが同水準=M字→弱気): レンジ上部でのみ成立
            double_top = False
            if len(peaks) >= 2 and not santen and not triple_top and not downtrend:
                last2 = [p[1] for p in peaks[-2:]]
                if (abs(last2[0] - last2[1]) / max(last2) < 0.04
                        and max(last2) >= seg_hi * 0.96 and cur < min(last2) * 0.97):
                    # 2つの山の間に明確な谷があるか
                    pi = peaks[-2][0]
                    valley = min(seg[pi:]) if pi < len(seg) else cur
                    if valley < min(last2) * 0.94:
                        double_top = True
            # ダブルボトム(安値2つが同水準=W字→強気): レンジ下部でのみ成立
            double_bottom = False
            if len(troughs) >= 2 and not gyaku and not triple_bottom and not uptrend:
                last2 = [t[1] for t in troughs[-2:]]
                if (abs(last2[0] - last2[1]) / max(last2) < 0.04
                        and min(last2) <= seg_lo * 1.04 and cur > max(last2) * 1.03):
                    ti = troughs[-2][0]
                    peak_between = max(seg[ti:]) if ti < len(seg) else cur
                    if peak_between > max(last2) * 1.06:
                        double_bottom = True
            # フラッグ(継続型パターン統合): 急騰→保ち合い→上抜け。
            # 上昇フラッグ/ペナント/上昇トライアングル/レクタングル/ウェッジ等の
            # 「上昇後の保ち合い」を全部ここに集約(カップ&ハンドルと下降系は別扱い)
            flag = False
            if len(seg) >= 25:
                # 少し前(10〜20日前あたり)に急騰したか
                run_up = max(
                    (seg[-15] / seg[-25] - 1) if seg[-25] else 0,
                    (seg[-10] / seg[-20] - 1) if seg[-20] else 0,
                )
                box = seg[-12:]  # 直近12日の保ち合い区間
                box_range = (max(box) - min(box)) / max(box) if max(box) else 1
                # 収縮判定(三角/ペナント/ウェッジ): 前半のレンジ > 後半のレンジ×1.25
                h1, h2 = box[:6], box[6:]
                r1 = (max(h1) - min(h1)) / max(h1) if max(h1) else 0
                r2 = (max(h2) - min(h2)) / max(h2) if max(h2) else 1
                contracting = r1 > r2 * 1.25
                # フラット保ち合い(フラッグ/レクタングル): レンジ12%以内
                boxy = box_range <= 0.12
                # 急騰8%以上 → 保ち合い(フラット or 収縮) → 保ち合い上限を上抜け
                if run_up >= 0.08 and (boxy or (contracting and box_range <= 0.16)) \
                        and cur >= max(box[:-1]) * 0.985:
                    flag = True

            # 三角持ち合い(直近20日で高値切り下げ×安値切り上げ=収縮)
            # ブレイク前=収縮の内側 / ブレイク後=上限を上抜け
            tri_pre = False
            tri_post = False
            if len(seg) >= 20 and not flag:
                tri = seg[-20:]
                h1t, h2t = max(tri[:10]), max(tri[10:])
                l1t, l2t = min(tri[:10]), min(tri[10:])
                tri_range = (max(tri) - min(tri)) / max(tri) if max(tri) else 1
                converging = (h2t <= h1t * 1.005) and (l2t >= l1t * 0.995) \
                    and ((h1t - l1t) > (h2t - l2t) * 1.25)  # 前半より後半のレンジが25%以上収縮
                if converging and 0.03 <= tri_range <= 0.20:
                    upper = max(tri[10:-1]) if len(tri[10:-1]) else h2t  # 直近の上限(当日除く)
                    if cur > upper * 1.005:
                        tri_post = True   # 三角持ち合いブレイク後
                    elif cur >= l2t:
                        tri_pre = True    # 三角持ち合い(ブレイク前・収縮中)

            # 高値更新中(52週高値の98.5%以上)
            if hi52 and cur >= hi52 * 0.985:
                pattern = "52週高値更新"
            elif flag:
                pattern = "フラッグブレイク"
            elif gyaku:
                pattern = "逆三尊・底打ち"
            elif santen:
                pattern = "三尊・天井注意"
            elif triple_bottom:
                pattern = "トリプルボトム"
            elif triple_top:
                pattern = "トリプルトップ"
            elif double_bottom:
                pattern = "ダブルボトム"
            elif double_top:
                pattern = "ダブルトップ"
            elif tri_post:
                pattern = "三角ブレイク"
            # ブレイク後(直近60日高値を上抜け＋出来高増)
            elif cur >= prior_hi and vol_up and cur > recent20_hi * 0.99:
                pattern = "直近高値ブレイク"
            # ブレイク前(3ヶ月高値の2%以内に接近・未突破)
            elif prior_hi and prior_hi * 0.98 <= cur < prior_hi:
                pattern = "直近高値ブレイクリーチ"
            elif tri_pre:
                pattern = "三角ブレイクリーチ"
            # CWH(カップウィズハンドル): 深い谷から回復した形。2段階で判定
            elif len(closes) >= 40:
                cup_zone = closes[-40:-8]  # カップの底を探す区間
                cup_bottom = min(cup_zone) if cup_zone else None
                left_peak = max(closes[-60:-40]) if len(closes) >= 60 else recent60_hi  # カップ左の高値
                neckline = left_peak  # ネックライン=カップ左右の高値
                if (cup_bottom and cup_bottom <= recent60_hi * 0.82  # 深いカップがある
                        and ma25v):
                    pos = (cur - cup_bottom) / (neckline - cup_bottom) if neckline > cup_bottom else 0
                    # pos: カップ底=0, ネックライン=1.0
                    # 買い場(ハンドルの押し目 or ネックライン上抜け)
                    if cur >= neckline * 0.985 or (pos >= 0.72 and dev5 is not None and -6 <= dev5 <= 1):
                        pattern = "CWH押し目/抜け"
                    elif pos >= 0.5:
                        pattern = "CWH形成中"
            # 新安値
            elif lo52 and cur <= lo52 * 1.02:
                pattern = "52週安値圏"
        quotes[sym] = {
            "name": name, "market": market,
            "last": daily[-1][1], "lastDate": daily[-1][0],
            "chg": chg,
            "volRatio": vol_ratio,
            "volSurge": vol_surge,  # 出来高急増レベル(0/1=2倍/2=3倍/3=5倍)
            "bbWalk": bb_walk,      # ボリンジャーバンドウォーク(up/down)
            "bbPctB": bb_pctb,      # %B(1.0=+2σ, 0=-2σ)
            "dev25": dev25,         # 25日線乖離率(%)
            "dev50": dev50,         # 50日線乖離率(%)
            "dev5": dev5,           # 5日線乖離率(%)
            "ret3d": ret3d,         # 3日リターン(%)
            "ret5d": ret5d,         # 5日リターン(%)
            "streak": streak,       # 連続上昇(+)/下落(-)日数
            "daytrade": daytrade,   # デイトレ妙味(資金流入急増/初動/急落リバ)
            "ret1m": ret1m,         # 1ヶ月騰落率(%)
            "ret3m": ret3m,         # 3ヶ月騰落率(%)
            "rsi": rsi,             # RSI(14)
            "posPct": posPct,       # 52週レンジ内の位置(%)
            "hi52": round(hi52, 2) if hi52 else None,  # 52週高値(終値ベース)
            "lo52": round(lo52, 2) if lo52 else None,  # 52週安値(終値ベース)
            "hiAll": round(hi_all, 2) if hi_all else None,  # 取得全期間の高値(参考値)
            "signal": signal,       # 押し目/調整中/過熱/25日線付近
            "pattern": pattern,     # 直近高値ブレイク/52週高値更新/三角ブレイク/CWH等
            "po": perfect_order,    # パーフェクトオーダー(日足・強気)
            "poBear": perfect_order_bear,  # 逆パーフェクトオーダー(弱気)
            "pullback": pullback,   # 押し目(5日線/25日線/75日線)
            "pullbackMa": pullback_ma,  # どの線の押し目か(5/25/50/75)
            "tags": STOCK_TAGS.get(sym, []),  # タグ(tags.py由来。属するテーマ/タグ表示+タグ検索対象)
            # daily: [日付, 終値, 出来高, 始値, 高値, 安値]
            # data.jsonには直近250本だけ載せる(日足チャートは80本表示。長期は週足/月足で見る)。
            # 直近130本はOHLC付き(ローソク)、それ以前は終値+出来高(容量削減)。
            # ※MA計算・パターン判定はKEEP_DAYS(460本)の全履歴で済ませてある。
            "daily": [
                ([r[0], round(r[1], 3), int(r[2]) if r[2] else 0,
                  round(r[3], 3) if len(r) > 3 else round(r[1], 3),
