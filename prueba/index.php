<?php
require './FPHP/conex.php';
session_start();
?>



<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- Page Title -->
        <title>Portalwebunimar</title>
        <link rel="shortcut icon" href="https://portalunimar.unimar.edu.ve/image/unimar.ico">
        <!-- CSRF Token -->
        <meta name="csrf-token" content="0ZumWRdOe42UsZ3M7O3AC5NY6BKCWxRVlIfR5dDs">
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
        <!-- Font Awesome -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet">
        <!-- Google Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&amp;display=swap" rel="stylesheet">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&amp;display=swap" rel="stylesheet">
        <!-- Fonts -->
        <link rel="dns-prefetch" href="//fonts.gstatic.com">
        <!-- App Styles -->
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/app.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/stylecss.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/fix.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/header.css">
        <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/footer.css">
        <!-- Page Styles -->
            <!-- Home Custom Styles -->
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/home.css">
    <link rel="stylesheet" href="https://portalunimar.unimar.edu.ve/css/portalunimar/radio/home_absolute_btn.css">
        <!-- MDB -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/3.5.0/mdb.min.css" rel="stylesheet">
        <!-- App Scripts -->
        <script src="https://portalunimar.unimar.edu.ve/js/app.js" defer=""></script>
        <script src="https://portalunimar.unimar.edu.ve/js/portalunimar/header.js" defer=""></script>
        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script><style type="text/css" id="operaUserStyle"></style>
        <!-- Popper.js -->
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js" integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB" crossorigin="anonymous"></script>
        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
    <script src="https://js.zohocdn.com/salesiq/RESOURCE_BUNDLES/embedfloat/js/float~plain~modern.0gi52aUC-H35baJdd3p_GQa2LTxlXnc1S8ZasJ8SIXRJNQ6xpAYix3SRC6AGWmdt.js" type="module" id="zsiqscript"></script><script src="https://js.zohocdn.com/salesiq/RESOURCE_BUNDLES/embedfloat/js/float~plain.AIWLjXTukGcEd7n-z4d7DH81QA8hz-82TG23yHejnUqUnh0l_z-yIf2YwnFiC7_U.js" type="nomodule" id="zsiqscript"></script><link rel="stylesheet" type="text/css" href="https://css.zohocdn.com/salesiq/RESOURCE_BUNDLES/embedfloat/css/float.PnZGHYzOXJxhJZYhhkdH-4gttOu0Ald2EDbU6VjRmYsY4u-o36dVnA9JVla3ntRQ.css"><style type="text/css">:root [href^="//mage98rquewz.com/"], :root [href^="//x4pollyxxpush.com/"], :root span[id^="ezoic-pub-ad-placeholder-"], :root ins.adsbygoogle[data-ad-slot], :root ins.adsbygoogle[data-ad-client], :root img[src^="https://s-img.adskeeper.com/"], :root guj-ad, :root gpt-ad, :root div[id^="zergnet-widget"], :root div[id^="vuukle-ad-"], :root div[id^="taboola-stream-"], :root div[id^="sticky_ad_"], :root div[id^="st"][style^="z-index: 999999999;"], :root div[id^="gpt_ad_"], :root div[id^="ezoic-pub-ad-"], :root div[id^="dfp-ad-"], :root div[id^="crt-"][style], :root div[id^="adspot-"], :root div[id^="adrotate_widgets-"], :root ps-connatix-module, :root div[id^="ad_position_"], :root div[id^="ad-div-"], :root div[id*="ScriptRoot"], :root div[id*="MarketGid"], :root div[data-id-advertdfpconf], :root div[data-dfp-id], :root hl-adsense, :root div[data-contentexchange-widget], :root div[data-alias="300x250 Ad 2"], :root div[data-adzone], :root div[data-adunit-path], :root div[data-adname], :root div[data-ad-targeting], :root div[data-ad-region], :root div[data-ad-placeholder], :root div[aria-label="Ads"], :root display-ads, :root display-ad-component, :root atf-ad-slot, :root aside[id^="adrotate_widgets-"], :root amp-fx-flying-carpet, :root amp-embed[type="taboola"], :root amp-connatix-player, :root amp-ad-custom, :root amp-ad, :root div[id^="google_dfp_"], :root ad-slot, :root ad-shield-ads, :root a[style="width:100%;height:100%;z-index:10000000000000000;position:absolute;top:0;left:0;"], :root a[onmousedown^="this.href='https://paid.outbrain.com/network/redir?"] + .ob_source, :root a[href^="https://xbet-4.com/"], :root div[id^="ad-position-"], :root a[href^="https://www.toprevenuegate.com/"], :root a[href^="https://www.purevpn.com/"][href*="&utm_source=aff-"], :root a[href^="https://www.privateinternetaccess.com/"] > img, :root a[href^="https://financeads.net/tc.php?"], :root a[href^="https://www.mrskin.com/tour"], :root a[href^="https://www.infowarsstore.com/"] > img, :root a[href^="https://www.highperformancecpmgate.com/"], :root a[href^="https://www.highcpmrevenuenetwork.com/"], :root a[href^="https://www.get-express-vpn.com/offer/"], :root a[href^="https://lnkxt.bannerator.com/"], :root a[href^="https://www.geekbuying.com/dynamic-ads/"], :root a[href^="https://www.financeads.net/tc.php?"], :root a[href^="https://www.effectiveratecpm.com/"], :root [href^="https://www.herbanomic.com/"] > img, :root a[href^="https://maymooth-stopic.com/"], :root a[href^="https://www.dql2clk.com/"], :root a[href^="https://www.nutaku.net/signup/landing/"], :root a[href^="https://www.dating-finder.com/signup/?ai_d="], :root a[href^="https://explore-site.com/"], :root a[href^="https://www.brazzersnetwork.com/landing/"], :root a[href^="https://www.adxsrve.com/"], :root [data-template-type="nativead"], :root a[href^="https://www.endorico.com/Smartlink/"], :root a[href^="https://www.adultempire.com/"][href*="?partner_id="], :root a[href^="https://voluum.prom-xcams.com/"], :root a[href^="https://twinrdsrv.com/"], :root a[href^="https://trk.nfl-online-streams.club/"], :root a[href^="https://tracking.avapartner.com/"], :root a[href^="https://track.wg-aff.com"], :root a[href^="https://track.ultravpn.com/"], :root a[href^="https://track.afcpatrk.com/"], :root a[href^="https://torguard.net/aff.php"] > img, :root [data-identity="adhesive-ad"], :root a[href^="https://tc.tradetracker.net/"] > img, :root a[href^="https://tatrck.com/"], :root a[href^="https://click.candyoffers.com/"], :root [href^="https://zstacklife.com/"] img, :root a[href^="https://t.aslnk.link/"], :root a[href^="https://t.adating.link/"], :root a[href^="https://go.trackitalltheway.com/"], :root [href^="https://track.fiverr.com/visit/"] > img, :root a[href^="https://syndication.exoclick.com/"], :root a[href^="https://syndication.dynsrvtbg.com/"], :root div[data-alias="300x250 Ad 1"], :root a[href^="https://syndicate.contentsserved.com/"], :root a[href^="https://svb-analytics.trackerrr.com/"], :root a[href^="https://ad.doubleclick.net/"], :root a[href^="https://static.fleshlight.com/images/banners/"], :root a[href^="https://slkmis.com/"], :root bottomadblock, :root a[href^="https://s.zlinkd.com/"], :root a[href^="https://s.zlink3.com/"], :root a[href^="https://www.mrskin.com/account/"], :root a[href^="https://s.optzsrv.com/"], :root a[href^="https://s.ma3ion.com/"], :root a[href^="https://s.eunow4u.com/"], :root #kt_player > div[style$="display: block;"][style*="inset: 0px;"], :root [href$="/sexdating.php"], :root a[href^="https://quotationfirearmrevision.com/"], :root a[href^="https://pubads.g.doubleclick.net/"], :root a[href^="https://prf.hn/click/"][href*="/camref:"] > img, :root a[href^="https://www.dating-finder.com/?ai_d="], :root a[href^="https://serve.awmdelivery.com/"], :root a[href^="https://prf.hn/click/"][href*="/adref:"] > img, :root app-ad, :root [href^="https://ap.octopuspop.com/click/"] > img, :root a[href^="https://postback1win.com/"], :root a[href^="https://mmwebhandler.aff-online.com/"], :root a[href^="https://www.bet365.com/"][href*="affiliate="], :root a[href^="https://pb-track.com/"], :root a[href^="https://pb-front.com/"], :root a[href^="https://paid.outbrain.com/network/redir?"], :root a[href^="https://streamate.com/landing/click/"], :root div[class^="Adstyled__AdWrapper-"], :root a[href^="https://osfultrbriolenai.info/"], :root a[href^="https://upsups.click/"], :root a[href^="https://ndt5.net/"], :root a[href^="https://natour.naughtyamerica.com/track/"], :root a[href^="https://mediaserver.entainpartners.com/renderBanner.do?"], :root a[href^="https://m.do.co/c/"] > img, :root a[href^="https://lead1.pl/"], :root a[href^="https://landing.brazzersnetwork.com/"], :root a[href^="https://join.virtuallust3d.com/"], :root a[href^="https://kiksajex.com/"], :root a[href^="https://juicyads.in/"], :root a[href^="https://snowdayonline.xyz/"], :root a[href^="https://mediaserver.gvcaffiliates.com/renderBanner.do?"], :root a[href^="https://join.dreamsexworld.com/"], :root a[href^="https://jaxofuna.com/"], :root a[href^="https://italarizege.xyz/"], :root a[href^="https://iqbroker.com/"][href*="?aff="], :root a[href^="https://identicaldrench.com/"], :root a[href^="https://hot-growngames.life/"], :root a[href^="https://helmethomicidal.com/"], :root a[href^="https://golinks.work/"], :root ark-top-ad, :root a[href^="https://s.zlinkn.com/"], :root a[href^="https://go.xxxvjmp.com/"], :root [class^="tile-picker__CitrusBannerContainer-sc-"], :root a[href^="https://go.xxxiijmp.com"], :root a[href^="https://go.xtbaffiliates.com/"], :root [data-role="tile-ads-module"], :root a[href^="https://go.xlviirdr.com"], :root div[class$="-adlabel"], :root a[href^="https://go.xlviiirdr.com"], :root a[href^="https://ismlks.com/"], :root [href^="https://www.mypillow.com/"] > img, :root a[href^="https://go.xlirdr.com"], :root [data-css-class="dfp-inarticle"], :root a[href^="https://l.hyenadata.com/"], :root a[href^="https://go.tmrjmp.com"], :root a[href^="https://zirdough.net/"], :root a[href^="https://s.deltraff.com/"], :root a[href^="https://go.markets.com/visit/?bta="], :root a[href^="https://billing.purevpn.com/aff.php"] > img, :root a[href^="https://go.hpyrdr.com/"], :root a[href^="https://lijavaxa.com/"], :root a[href^="https://go.goaserv.com/"], :root a[href^="https://t.hrtye.com/"], :root a[href^="https://go.etoro.com/"] > img, :root a[href^="https://go.dmzjmp.com"], :root a[href^="https://www.bang.com/?aff="], :root #mgb-container > #mgb, :root a[href^="https://go.admjmp.com"], :root a[href^="https://ak.stikroltiltoowi.net/"], :root a[href^="https://get.surfshark.net/aff_c?"][href*="&aff_id="] > img, :root a[href^="https://www.adskeeper.com"], :root a[data-redirect^="https://paid.outbrain.com/network/redir?"], :root [href^="https://clicks.affstrack.com/"] > img, :root a[href^="https://ak.hauchiwu.com/"], :root a[href^="https://engine.phn.doublepimp.com/"], :root a[href^="https://engine.blueistheneworanges.com/"], :root a[href^="https://drumskilxoa.click/"], :root a[href^="https://dl-protect.net/"], :root a[href*=".foxqck.com/"], :root a[href^="https://ctosrd.com/"], :root a[href^="https://clixtrac.com/"], :root [href^="https://noqreport.com/"] > img, :root a[href^="https://clicks.pipaffiliates.com/"], :root app-advertisement, :root a[href^="https://getmatchedlocally.com/"], :root a[href^="https://clickins.slixa.com/"], :root a[href^="https://datewhisper.life/"], :root a[href^="https://get-link.xyz/"], :root a[href^="https://click.linksynergy.com/fs-bin/"] > img, :root a[href^="https://combodef.com/"], :root a[href^="https://click.hoolig.app/"], :root a[href^="https://www.onlineusershielder.com/"], :root a[href^="https://click.ggpickaff.com/"], :root a[href^="https://track.totalav.com/"], :root a[href^="https://ctrdwm.com/"], :root img[src^="https://images.purevpnaffiliates.com"], :root a[href^="https://porntubemate.com/"], :root a[href^="https://clickadilla.com/"], :root a[href^="https://click.dtiserv2.com/"], :root a[href^="https://go.xlvirdr.com"], :root a[href^="http://www.iyalc.com/"], :root a[href^="https://claring-loccelkin.com/"], :root a[href^="https://bongacams2.com/track?"], :root a[href^="https://t.ajrkm1.com/"], :root a[href^="https://bongacams10.com/track?"], :root a[href^="https://www.sheetmusicplus.com/"][href*="?aff_id="], :root a[href^="https://bngpt.com/"], :root a[href^="https://black77854.com/"], :root a[href^="https://rixofa.com/"], :root #ads[style^="position: absolute; z-index: 30; width: 100%; height"], :root a[href^="https://disobediencecalculatormaiden.com/"], :root a[href^="https://best-experience-cool.com/"], :root a[href^="https://banners.livepartners.com/"], :root a[href^="http://revolvemockerycopper.com/"], :root a[href^="https://awptjmp.com/"], :root a[href^="https://join.sexworld3d.com/track/"], :root a[href^="https://aweptjmp.com/"], :root a[href^="https://ausoafab.net/"], :root a[href^="https://adclick.g.doubleclick.net/"], :root a[href^="https://aj1070.online/"], :root a[href^="https://bc.game/"], :root a[href^="https://ak.oalsauwy.net/"], :root a[href^="https://a.bestcontentoperation.top/"], :root a[href^="https://adultfriendfinder.com/go/"], :root a[href^="https://ads.planetwin365affiliate.com/"], :root a[href^="https://ads.leovegas.com/"], :root .nya-slot[style], :root a[href^="https://a.bestcontentweb.top/"], :root a[href^="https://a2.adform.net/"], :root a[href^="https://a.candyai.love/"], :root a[href^="https://playnano.online/offerwalls/?ref="], :root a[href^="https://a.adtng.com/"], :root .banner-img > .pbl, :root [data-m-ad-id], :root a[href^="https://a-ads.com/"], :root [id^="ad_slider"], :root a[href^="https://click.ggpickyaff.com/"], :root broadstreet-zone-container, :root a[href^="https://ak.psaltauw.net/"], :root a[href^="https://1winpb.com/"], :root div[id^="rc-widget-"], :root a[href^="http://eslp34af.click/"], :root a[href^="https://turnstileunavailablesite.com/"], :root a[href^="https://chaturbate.com/in/?"], :root a[href^="https://prf.hn/click/"][href*="/creativeref:"] > img, :root a[href*="&maxads="], :root a[href^="http://www.adultempire.com/unlimited/promo?"][href*="&partner_id="], :root a[href^="https://1betandgonow.com/"], :root a[href^="https://eergortu.net/"], :root div[id^="optidigital-adslot"], :root a[href^="https://123-stream.org/"], :root a[href^="https://in.rabbtrk.com/"], :root a[href^="http://www.h4trck.com/"], :root a[href^="http://www.friendlyduck.com/AF_"], :root a[href^="https://go.rmhfrtnd.com"], :root a[href^="https://allhost.shop/aff.php?"], :root [data-dynamic-ads], :root a[href^="http://vnte9urn.click/"], :root a[href^="http://troopsassistedstupidity.com/"], :root a[href^="http://trk.globwo.online/"], :root a[href^="https://random-affiliate.atimaze.com/"], :root a-ad, :root a[href^="https://offhandpump.com/"], :root a[href^="http://stickingrepute.com/"], :root #slashboxes > .deals-rail, :root a[href^="http://roadcontagion.com/"], :root a[href^="http://premonitioninventdisagree.com/"], :root a[href^="http://cam4com.go2cloud.org/aff_c?"], :root a[href^="https://ads.betfair.com/redirect.aspx?"], :root [href^="https://www.mypatriotsupply.com/"] > img, :root a[href^="https://trk.softonixs.xyz/"], :root a[href^="https://sexynearme.com/"], :root a[href^="https://myclick-2.com/"], :root [data-advadstrackid], :root a[href^="http://muzzlematrix.com/"], :root a[href^="https://track.adform.net/"], :root a[href^="http://avthelkp.net/"], :root a[href^="https://a.medfoodhome.com/"], :root a[href^="https://engine.flixtrial.com/"], :root [data-type="ad-vertical"], :root [data-taboola-options], :root a[href^="http://annulmentequitycereals.com/"], :root a[href^="//startgaming.net/tienda/" i], :root a[href^="https://join.virtualtaboo.com/track/"], :root [id^="ad_sky"], :root a[href^="http://coefficienttolerategravel.com/"], :root a[href^="https://a.medfoodsafety.com/"], :root a[href^="//go.eabids.com/"], :root a[href^="//ejitsirdosha.net/"], :root a[href^=" https://www.friendlyduck.com/AF_"], :root [data-cl-spot-id], :root a[href*="/jump/next.php?r="], :root a[href^="https://go.rmishe.com/"], :root [href^="https://ilovemyfreedoms.com/landing-"], :root a[href^="https://syndication.optimizesrv.com/"], :root a[href*="//daichoho.com/"], :root a[href^="https://go.nordvpn.net/aff"] > img, :root .\[\&_\.gdprAdTransparencyCogWheelButton\]\:\!pjra-z-\[5\], :root [href^="http://clicks.totemcash.com/"], :root a[href^="https://ad.zanox.com/ppc/"] > img, :root a[href^="https://lone-pack.com/"], :root [data-d-ad-id], :root a[href*=".engine.adglare.net/"], :root a[href^="https://t.ajrkm3.com/"], :root [href^="https://aads.com/campaigns/"], :root a[href^="//stighoazon.com/"], :root [href^="https://www.profitablegatecpm.com/"], :root div[id^="lazyad-"], :root a[href^="http://com-1.pro/"], :root a[href*=".cfm?domain="][href*="&fp="], :root [data-ad-name], :root a[href^="https://loboclick.com/"], :root a[data-url^="https://vulpix.bet/?ref="], :root a[href^="https://ab.advertiserurl.com/aff/"], :root a[data-oburl^="https://paid.outbrain.com/network/redir?"], :root a[href^="https://go.xlivrdr.com"], :root [onclick^="location.href='https://1337x.vpnonly.site/"], :root [name^="google_ads_iframe"], :root [id^="section-ad-banner"], :root a[href^="https://www.goldenfrog.com/vyprvpn?offer_id="][href*="&aff_id="], :root a[href*="//jjgirls.com/sex/Chaturbate"], :root [id^="ad-wrap-"], :root [href^="https://zone.gotrackier.com/"], :root a[href^="http://sarcasmadvisor.com/"], :root [href^="https://www.restoro.com/"], :root [href^="https://www.targetingpartner.com/"], :root .section-subheader > .section-hotel-prices-header, :root [href^="https://www.hostg.xyz/"] > img, :root a[href^="http://adultfriendfinder.com/go/"], :root a[href^="https://fastestvpn.com/lifetime-special-deal?a_aid="], :root a[href^="https://tour.mrskin.com/"], :root [href^="https://www.brighteonstore.com/products/"] img, :root citrus-ad-wrapper, :root a[href^="https://go.grinsbest.com/"], :root a[href^="https://vo2.qrlsx.com/"], :root [href^="https://www.avantlink.com/click.php"] img, :root a[href^="https://t.acam.link/"], :root a[href^="https://go.strpjmp.com/"], :root [href^="https://url.totaladblock.com/"], :root div[id^="div-ads-"], :root [href^="https://rapidgator.net/article/premium/ref/"], :root [href^="https://join.girlsoutwest.com/"], :root a[href^="https://activate-game.com/"], :root .scroll-fixable.rail-right > .deals-rail, :root [data-wpas-zoneid], :root a[href^="https://track.aftrk3.com/"], :root [href^="https://join3.bannedsextapes.com"], :root a[href^="https://bodelen.com/"], :root a[href*=".g2afse.com/"], :root div[id^="adngin-"], :root [data-rc-widget], :root span[data-ez-ph-id], :root [href^="https://track.aftrk1.com/"], :root [href^="https://join.playboyplus.com/track/"], :root a[href^="https://go.xxxijmp.com"], :root [href^="https://istlnkcl.com/"], :root a[href^="https://tm-offers.gamingadult.com/"], :root [href^="https://charmingdatings.life/"], :root [href^="https://glersakr.com/"], :root a[href^="https://a.bestcontentfood.top/"], :root [href^="https://cpa.10kfreesilver.com/"], :root [data-id^="div-gpt-ad"], :root a[href^="https://tracker.loropartners.com/"], :root [href^="https://awbbjmp.com/"], :root div[ow-ad-unit-wrapper], :root a[data-href^="http://ads.trafficjunky.net/"], :root a[href^="http://partners.etoro.com/"], :root a[href^="https://www.friendlyduck.com/AF_"], :root [href^="https://ad1.adfarm1.adition.com/"], :root a[href^="https://bngprm.com/"], :root [href^="https://shiftnetwork.infusionsoft.com/go/"] > img, :root a[href^="https://go.bushheel.com/"], :root a[href^="https://ctjdwm.com/"], :root a[href^="https://camfapr.com/landing/click/"], :root div[data-ad-wrapper], :root .gnt_em_vp_c[data-g-s="vp_dk"], :root [href="//sexcams.plus/"], :root [href^="http://www.mypillow.com/"] > img, :root a[href^="https://promerycergerful.com/"], :root #kt_player > a[target="_blank"], :root a[href^="http://bongacams.com/track?"], :root [href^="http://mypillow.com/"] > img, :root [href="https://ourgoldguy.com/contact/"] img, :root .ob_container .item-container-obpd, :root [id^="div-gpt-ad"], :root a[href^="https://go.rmhfrtnd.com/"], :root [href="https://jdrucker.com/gold"] > img, :root a[href^="https://www.liquidfire.mobi/"], :root .grid > .container > #aside-promotion, :root DFP-AD, :root [href^="https://go.xlrdr.com"], :root a[href^="https://s.cant3am.com/"], :root [data-testid^="taboola-"], :root a[href^="https://track.1234sd123.com/"], :root zeus-ad, :root [data-testid="prism-ad-wrapper"], :root [href^="https://ad.admitad.com/"], :root [href^="https://mypillow.com/"] > img, :root [data-testid="ad_testID"], :root [href^="https://antiagingbed.com/discount/"] > img, :root a[href*=".adsrv.eacdn.com/"], :root [href^="https://optimizedelite.com/"] > img, :root [data-name="adaptiveConstructorAd"], :root a[href^="https://go.cmtaffiliates.com/"], :root [data-testid="adBanner-wrapper"], :root [href^="https://mylead.global/stl/"] > img, :root [href^="https://mypatriotsupply.com/"] > img, :root a[href^="https://go.hpyjmp.com"], :root iframe[scrolling="no"][sandbox*="allow-popups allow-modals"][style^="width: 100%; height: 100%; border: none;"], :root [href^="https://mystore.com/"] > img, :root a[href^="https://81ac.xyz/"], :root [href^="https://wct.link/click?"], :root div[data-adunit], :root app-large-ad, :root [href^="https://turtlebids.irauctions.com/"] img, :root a[href^="https://believessway.com/"], :root a[href^="https://witnessjacket.com/"], :root [data-mobile-ad-id], :root [class^="amp-ad-"], :root a[href^="http://handgripvegetationhols.com/"], :root a[href^="https://baipahanoop.net/"], :root a[href^="https://go.bbrdbr.com"], :root a[href^="https://fc.lc/ref/"], :root [data-adshim], :root topadblock, :root a[href^="//s.zlinkd.com/"], :root #teaser1[style^="width:autopx;"], :root [href^="https://www.cloudways.com/en/?id"], :root [data-asg-ins], :root a[href^="https://gamingadlt.com/?offer="], :root [data-desktop-ad-id], :root [data-adbridg-ad-class], :root #teaser3[style^="width:autopx;"], :root [data-adblockkey], :root [data-block-type="ad"], :root [data-ad-width], :root [onclick*="content.ad/"], :root [data-ad-manager-id], :root AMP-AD, :root [data-ad-cls], :root [data-ez-name], :root a[href^="https://go.mnaspm.com/"], :root a[href^="https://service.bv-aff-trx.com/"], :root a[href^="https://6-partner.com/"], :root [class^="s2nPlayer"], :root a[href^="https://traffdaq.com/"], :root [data-testid="commercial-label-taboola"], :root [class^="div-gpt-ad"], :root a[href^="http://tc.tradetracker.net/"] > img, :root a[href^="https://www8.smartadserver.com/"], :root a[href^="https://pb-imc.com/"], :root [href^="https://affiliate.fastcomet.com/"] > img, :root [class^="adDisplay-module"], :root [data-freestar-ad][id], :root AD-SLOT, :root a[href^="https://www.googleadservices.com/pagead/aclk?"] > img, :root [data-ad-module], :root a[href^="https://go.skinstrip.net"][href*="?campaignId="], :root #teaser2[style^="width:autopx;"], :root [data-revive-zoneid], :root a[href^="https://losingoldfry.com/"], :root div[id^="div-gpt-"], :root a[href^="https://gml-grp.com/"], :root .ob_dual_right > .ob_ads_header ~ .odb_div, :root a[href^="https://cam4com.go2cloud.org/"], :root a[href^="http://li.blogtrottr.com/click?"], :root a[onmousedown^="this.href='https://paid.outbrain.com/network/redir?"], :root a[href^="https://t.ajump1.com/"], :root a[href^="https://go.xxxjmp.com"], :root #leader-companion > a[href], :root a[href^="https://wittered-mainging.com/"], :root #teaser3[style="width: 100%;text-align: center;display: scroll;position:fixed;bottom: 0;margin: 0 auto;z-index: 103;"] { display: none !important; }</style><link rel="preconnect" href="https://js.zohocdn.com"><link rel="preconnect" href="https://css.zohocdn.com"><link rel="preconnect" href="https://us4-files.zohopublic.com"><link rel="preconnect" href="https://salesiq.zohopublic.com"><link rel="preconnect" href="https://salesiq.zoho.com"><link rel="preconnect" href="https://salesiq.zohopublic.com"><link rel="preconnect" href="https://static.zohocdn.com"></head>
<body>
        <!-- Header -->
        <div class="top-bar">
    <!-- Dollar Price -->
    <marquee style="background-color: #d0e0fc; color:#0b3d91;">
        <i class="fa fa-info-circle" aria-hidden="true"></i>
         El valor del dólar, según el BCV, para el día de hoy <span>07-06-2025 es </span><strong id="dollar-bcv-price">99.09</strong>&nbsp;Bs
    </marquee>
    <!-- /.dollar-price -->

    <!-- Social Media and Others -->
    <div class="container-fluid mt-2">
        <div class="row">
            <div class="col-sm-8 col-12 header-media">
                <div class="float-right header-media-float">
                    <a class="text-reset text-decoration-none" href="mailto:info@unimar.edu.ve">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/email.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.facebook.com/share/1CJrXgVUPe/">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/facebook.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.instagram.com/universidademargarita">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/instagram.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.twitter.com/somosunimar">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/gorjeo.png">
                    </a>
                    <a class="text-reset text-decoration-none" href="https://www.linkedin.com/company/univdemargarita">
                        <img class="img-rrss" src="https://portalunimar.unimar.edu.ve/./image/rrss/linkedin.png">
                    </a>
                    <a href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_self" title="pagos-online">
                        <img src="https://portalunimar.unimar.edu.ve/./image/online-payments-vertical.png" style="height:26.5px;">
                    </a>
                </div>
            </div>
            <div class="col-sm-4 col-12 header-user">
                <div class="text-right text-truncate mx-2 header-user-button">
                    <?php if (isset($_SESSION['usuario'])): ?>
                        <a href="admin_panel.php" class="loginuser">
                            <?php 
                            echo strtoupper(
                                htmlspecialchars($_SESSION['usuario']['apellido'] . ', ' . $_SESSION['usuario']['nombre'])
                            ); 
                            ?>
                        </a>
                    <?php else: ?>
                        <a href="./login.php" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Inicia Sesión" target="_self" style="text-decoration: none;">
                            <img src="https://portalunimar.unimar.edu.ve/./image/login-vertical.png" style="height: 26.5px;">
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <!-- /.social-media-and-others -->

    <!-- Navigation Bar -->
    <div class="container-fluid">
        <nav class="navbar navbar-expand-md navbar-light bg-white">
            <!-- Unimar Logo -->
            <a class="navbar-brand text-dark" href="./index.php"><img class="logo horizontal-logo" id="anniversary" src="https://portalunimar.unimar.edu.ve/image/logounimar-25-aniversario.png" alt="UNIMAR logo" width="100%"></a>
            <!-- Mobile Menu -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#demo-navbar" aria-controls="demo-navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="demo-navbar">
                <div class="navbar-nav ml-auto">
                    <!-- Home -->
                    <li class="nav-item px-1 active">
                        <a class="nav-link text-dark" href="./index.php">Inicio
                            <span class="sr-only">(current)</span>
                        </a>
                    </li>
                    <!-- Our Institution -->
                    <li class="nav-item px-1 dropdown">
                        <a class="nav-link dropdown-toggle" href="" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Nuestra Institución
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown2">
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/our-institution">UNIMAR</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/organization">Organización</a>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Rectorado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/rectorate">Nuestro Subsistema</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/curricula-dir">Planificación, Desarrollo y Evaluación Insitucional</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/RRHH-department">Talento Humano</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/psychological-support">Evaluación y Apoyo Psicológico</a></li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Secretaría General</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/general-secretary-department">Nuestro Subsistema</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/study-control">Control de Estudios</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/administration-dir">Administración</a>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Académico</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/academic-vicerectorate">Vicerrectorado</a></li>
                                    <li>
                                        <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/library">Biblioteca UNIMAR</a>
                                        <div class="dropdown-submenu">
                                            <a class="dropdown-item dropdown-toggle" href="#">Decanatos</a>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/general-studies-deanery">Estudios Generales</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/humarte-deanery">Humanidades, Artes y Educación</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/ceys-deanery">Ciencias Económicas y Sociales</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/cjyp-deanery">Ciencias Jurídicas  y Políticas</a></li>
                                                <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/engineering-deanery">Ingeniería y Afines</a></li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Extensión</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-vicerectorate">Vicerrectorado</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/community-service">Servicio Comunitario</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/regulations">Normativas</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/university-gazette">Publicaciones Oficiales</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/electoral-commission">Comisión Electoral</a>
                        </div>
                    </li>
                    <!-- Students -->
                    <li class="nav-item px-1 dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Estudia en UNIMAR
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown2">
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Pregrado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/new-students">Requisitos</a></li>
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/undergraduate">Carreras</a></li>
                                </ul>
                            </div>
                            <div class="dropdown-submenu"><a class="dropdown-item dropdown-toggle" href="#">Postgrado</a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/postgraduate/new-students">Requisitos</a></li>
                                </ul>
                            </div>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">Diplomados</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/extension-course/offers">Cursos y Talleres</a>
                            <a class="dropdown-item" href="https://portalunimar.unimar.edu.ve/graduate-registration">Egresados</a>
                        </div>
                    </li>
                    <!-- Postgraduate -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/postgraduate-department">Postgrado</a>
                    </li>
                    <!-- Research -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/research-dir">Investigación</a>
                    </li>
                    <!-- Services -->
                    <li class="nav-item px-1">
                        <a class="nav-link" href="https://portalunimar.unimar.edu.ve/services">Servicios</a>
                    </li>
                    <li class="nav-item px-1">
                        <a class="nav-link" href="./MMU.php">Multimedia Unimar</a>
                    </li>
                </div>
            </div>
        </nav>
    </div>
    <!-- /.navigation-bar -->
</div>
        <!-- /.header -->

        <!-- Content Page -->
        <main class="py-main">
                <!-- Vertical Modal -->
    
    <!-- /.vertical-modal -->

    <!-- Horizontal Modal -->
    
    <!-- /.horizontal-modal -->

    <!--Main Content -->
    <div class="content">
        <!-- Main Carousel -->
        <div id="home-carousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
            <div class="radio-absolute-btn">
                <a href="https://portalunimar.unimar.edu.ve/radio-unimar"><img src="https://portalunimar.unimar.edu.ve/image/views/es/home/radio-absolute-banner.png"></a>
            </div>
            <div class="carousel-inner">
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/luisa-virtual-assistant">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/luisa_bot_banner.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item active">
                    <a href="https://portalunimar.unimar.edu.ve/25-years-anniversary-unimar">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/25_years_anniversary_unimar_new.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/extension-diploma/teaching-component">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/teaching_component_2024_radiofixed.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/extension-diploma/gastronomic-business-management">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/gastronomic-business-management_radiofixed.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/postgraduate-department">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/postgraduate-page_radiofixed.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="http://revista.unimarcientifica.edu.ve/">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/scientific-blog-banner_radiofixed.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/online-payments-info">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/online_payments_radiofixed.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <a href="https://portalunimar.unimar.edu.ve/fcPayments">
                        <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/bank-onlineb.png" class="d-block w-100">
                    </a>
                </div>
                <div class="carousel-item">
                    <img src="https://portalunimar.unimar.edu.ve/image/banners/es/home/correo-web.png" class="d-block w-100">
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#home-carousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#home-carousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
        <!-- /.main-carousel -->

        <!-- News and Boards -->
        <div class="row">
            <div class="col-md-9">
                <div class="section-content">
                    <div class="d-flex justify-content-start align-items-center">
                        <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-02.png">
                        <h4>Noticias <a class="card-link card-link-whatch-more" href="https://portalunimar.unimar.edu.ve/news-unimar">Ver mas</a></h4>
                    </div>
                </div>
            </div>
            <div class="col-md-3 d-none d-md-block event-title-adjust-md">
                <div class="section-content">
                    <div class="d-flex justify-content-start align-items-center">
                        <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-03.png" width="100%">
                        <h4>Cartelera <a class="card-link card-link-whatch-more" href="https://portalunimar.unimar.edu.ve/board-unimar">Ver mas</a></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mx-4">
                            <div class="col-sm-6 col-md-3 my-2">
                    <div class="card bg-greey border-0 responsive">
                        <img src="https://portalunimar.unimar.edu.ve/image/newsimg/thumb_1749318699.JPG" alt="image-news" style="border-radius: 15px 15px 0 0;">
                        <div class="card-body">
                            <a class="card-link" href="https://portalunimar.unimar.edu.ve/news-unimar/Prensa%20Unimar/UNIMAR%20celebra%20su%20tradicional%20Caminata%20Acad%C3%A9mica%20en%20honor%20a%20su%20%20Promoci%C3%B3n%20XLI/190">
                                <h6 class="card-title font-weight-bold">UNIMAR celebra su tradicional Caminata Académica en honor a su  Promoción XLI</h6>
                            </a>
                            <div class="card-content" id="card-content" style="font-size: x-small;">
                                <div class="text-justify m-0"><p>Como parte de las actividades programadas para la Promoción XLI Epónimo “25 Aniversario de la Universidad de Margarita”, la Universidad de Margarita (Unimar) llevó a cabo su tradicional caminata académica, un evento cargado de simbolismo en el que los graduandos recorren la Avenida Concepción Mariño (El Valle del Espíritu Santo) para regresar a su Alma Mater convertidos en profesionales.</p></div>
                            </div>
        
                        </div>
                    </div>
                </div>
                            <div class="col-sm-6 col-md-3 my-2">
                    <div class="card bg-greey border-0 responsive">
                        <img src="https://portalunimar.unimar.edu.ve/image/newsimg/thumb_1749313888.JPG" alt="image-news" style="border-radius: 15px 15px 0 0;">
                        <div class="card-body">
                            <a class="card-link" href="https://portalunimar.unimar.edu.ve/news-unimar/Prensa%20Unimar/Presb%C3%ADtero%20Andr%C3%A9s%20Villarroel%20Rivero:%20%E2%80%9CQue%20la%20gratitud%20sea%20el%20motor%20que%20impulse%20sus%20acciones%E2%80%9D/189">
                                <h6 class="card-title font-weight-bold">Presbítero Andrés Villarroel Rivero: “Que la gratitud sea el motor que impulse sus acciones”</h6>
                            </a>
                            <div class="card-content" id="card-content" style="font-size: x-small;">
                                <div class="text-justify m-0"><p>El pasado 17 de mayo, en las afueras de la Basílica Menor de Nuestra Señora del Valle, la Universidad de Margarita (Unimar) celebró la Misa de Acción de Gracias de la Promoción XLI Epónimo “25 Aniversario de la Universidad de Margarita”, oficiada por el Presbítero Andrés Villarroel Rivero en presencia de autoridades, docentes, personal administrativo, familiares y feligreses de la comunidad.</p></div>
                            </div>
        
                        </div>
                    </div>
                </div>
                            <div class="col-sm-6 col-md-3 my-2">
                    <div class="card bg-greey border-0 responsive">
                        <img src="https://portalunimar.unimar.edu.ve/image/newsimg/thumb_1747684626.JPG" alt="image-news" style="border-radius: 15px 15px 0 0;">
                        <div class="card-body">
                            <a class="card-link" href="https://portalunimar.unimar.edu.ve/news-unimar/Prensa%20Unimar/Unimar%20celebra%20Firma%20del%20Libro%20de%20Actas%20de%20la%20XLI%20Promoci%C3%B3n%20%2225%20Aniversario%22/188">
                                <h6 class="card-title font-weight-bold">Unimar celebra Firma del Libro de Actas de la XLI Promoción "25 Aniversario"</h6>
                            </a>
                            <div class="card-content" id="card-content" style="font-size: x-small;">
                                <div class="text-justify m-0"><p>La Universidad de Margarita (UNIMAR) celebró la Firma del Libro de Actas de la XLI Promoción Epónimo “25 Aniversario de la Universidad de Margarita”, en una ceremonia realizada el 15 de mayo en el Aula Abierta, con la presencia de autoridades, docentes, familiares y amigos.</p></div>
                            </div>
        
                        </div>
                    </div>
                </div>
            
            <div class="col-md-12 d-md-none d-block d-sm-none" style="padding-left: 0;">
                <div class="section-content">
                    <div class="d-flex justify-content-start align-items-center">
                        <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-03.png" style="margin-left: 0;">
                        <h4>Cartelera <a class="card-link card-link-whatch-more" href="https://portalunimar.unimar.edu.ve/board-unimar">Ver mas</a></h4>
                    </div>
                </div>
            </div>
            <div class="row col-sm-6 col-md-3">
                <div class="col-md-12 d-none d-sm-block d-md-none">
                    <div class="section-content">
                        <div class="d-flex justify-content-start align-items-center">
                            <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-03.png" width="100%">
                            <h4>Cartelera <a class="card-link card-link-whatch-more" href="https://portalunimar.unimar.edu.ve/board-unimar">Ver mas</a></h4>
                        </div>
                    </div>
                </div>
                                    <div class="col-md-12 my-2" style="padding: 0;">
                        <div class="row no-gutters bg-greey" style="height:100%;">
                            <div class="col-md-4 text-white content-date" style="border-radius:0px;">
                                <img src="https://portalunimar.unimar.edu.ve/image/board/transparent/1.png" style="width:100%">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body" id="card-content">
                                    <h5 class="card-title font-weight-bold text-left mx-2"><a class="card-link" href="https://portalunimar.unimar.edu.ve/board-unimar/Conferencias%20y%20talleres/Conferencia%20%22Bol%C3%ADvar:%20Triunfo%20y%20Ocaso%22/163" style="font-size: 0.95rem;">Conferencia "Bolívar: Triunfo y Ocaso"</a></h5>
                                    <p class="card-text text-justify mx-2" style="width: 80%;"></p>
                                    <div class="card-text text-justify mx-2" style="width: 80%;"><p>Cátedra Libre Jóvito Villalba te invita a la conferencia "Bolívar: Triunfo y Ocaso", a cargo del destacado historiador Dr. Rafael Arráiz Lucca, a realizarse el viernes 6 de junio a las 10:00 AM en Sala de Conferencias I</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                                    <div class="col-md-12 my-2" style="padding: 0;">
                        <div class="row no-gutters bg-greey" style="height:100%;">
                            <div class="col-md-4 text-white content-date" style="border-radius:0px;">
                                <img src="https://portalunimar.unimar.edu.ve/image/board/transparent/0.png" style="width:100%">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body" id="card-content">
                                    <h5 class="card-title font-weight-bold text-left mx-2"><a class="card-link" href="https://portalunimar.unimar.edu.ve/board-unimar/Otros/Convocatoria%20a%20la%20comunidad%20universitaria/162" style="font-size: 0.95rem;">Convocatoria a la comunidad universitaria</a></h5>
                                    <p class="card-text text-justify mx-2" style="width: 80%;"></p>
                                    <div class="card-text text-justify mx-2" style="width: 80%;"><p>La Comisión Electoral de la Universidad de Margarita convoca a la comunidad unimarista a participar en el proceso electoral del mes de junio 2025</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                            </div>
        </div>
        <!-- /.news-and-board -->
        
        <!-- Academic Areas -->
        <div class="section-content">
            <div class="d-flex justify-content-start align-items-center">
                <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-04.png" width="100%">
                <h4>Áreas Académicas</h4>
            </div>
        </div>
        <div class="content mx-4">
            <div class="row justify-content-center border-0 m-2">
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/humarte-deanery">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/humarte.png" alt="Humanidades, Artes y Educación" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/cjyp-deanery">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/cjyp.png" alt="Ciencias Jurídicas  y Políticas" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/ceys-deanery">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/ceys.png" alt="Ciencias Económicas y Sociales" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/engineering-deanery">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/ing.png" alt="Ingeniería de Sistemas y Afines" width="100%">
                    </a>
                </div>
            </div>
            <div class="row justify-content-center border-0 m-2">
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/general-studies-deanery">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/estgen.png" alt="Estudios Generales" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/extension-vicerectorate">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/ext.png" alt="Extensión" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/postgraduate/research">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/post.png" alt="Investigación y Postgrado" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/agreements">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/acadconv.png" alt="Acuerdos Académicos" width="100%">
                    </a>
                </div>
            </div>
        </div>
        <!-- /.academic-areas -->

        <!-- Other Links -->
        <div class="section-content">
            <div class="d-flex justify-content-start align-items-center">
                <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-05.png" width="100%"><h4>Enlaces de Interés</h4>
            </div>
        </div>
        <div class="content mx-4">
            <div class="row justify-content-center border-0 m-2">
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/study-offers">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-07.png" alt="Ofertas de Estudios" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://www.unimarcientifica.edu.ve/amu/" target="_blank">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-08.png" alt="Educación Virtual" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="http://revista.unimarcientifica.edu.ve/">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-09.png" alt="Unimar Científica" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/regulations">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-10.png" alt="Normativas" width="100%">
                    </a>
                </div>
            </div>
            <div class="row justify-content-center border-0 m-2">
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/general-secretary-department">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-11.png" alt="Secretaría General" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/student-welfare">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-12.png" alt="Bienestar Estudiantil" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/psychological-support">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-13.png" alt="Evaluación y Apoyo Psicológico" width="100%">
                    </a>
                </div>
                <div class="col-sm-3 col-dm-3 my-2">
                    <a href="https://portalunimar.unimar.edu.ve/radio-unimar">
                        <img src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-14.png" alt="Radio Unimar" width="100%">
                    </a>
                </div>
            </div>
        </div>
        <!-- /.other-links -->

        <!-- Location Unimar -->
        <div class="section-content">
            <div class="d-flex justify-content-start align-items-center">
                <img id="img-section" src="https://portalunimar.unimar.edu.ve/image/views/es/home/home-06.png" width="100%"><h4>Ubicación</h4>
            </div>
        </div>
        <div class="location-content d-flex">
            <div class="row justify-content-center m-4">
                <div class="map-location col-sm-6 col-md-6">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.7972847852143!2d-63.88208018566738!3d10.978668292184503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c318c3b89e345cd%3A0xbaf23c34b11f9d7!2sUniversidad%20De%20Margarita!5e0!3m2!1ses-419!2sve!4v1620079489335!5m2!1ses-419!2sve" width="600" height="350&quot;" style="border:0;" allowfullscreen="" loading="lazy">
                    </iframe>
                </div>
                <div class="map-direction col-sm-6 col-md-6 text-left">
                    <p>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</p>
                    <p>Postal Code: 6308</p>
                    <p>Teléfonos: 0412.102.2538 / 0412.595.7440 / 0412.595.7430 </p>
                    <p>Plus Code: X4HC+F2 El Valle del Espíritu Santo, Nueva Esparta, Venezuela</p>
                    <p>Correo Electrónico: info@unimar.edu.ve</p>
                </div>
            </div>
        </div>
        <!-- /.location-unimar -->
    </div>
    <!-- /.main-content -->
        </main>
        <!-- /.content-page -->

        <!-- Footer -->
        <!-- Desktop Footer -->
<div class="footer col-sm-12" id="footerdesktop">
    <div class="footer-item">
        <!-- University Logo -->
        <div class="info-university">
            <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
            <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
        </div>
        <!-- Our Institution -->
        <div class="our-institution">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/our-institution">
                            Nuestra Institución
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/rectorate">Rectorado</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/vicerectorates">Vicerrectorados</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/deaneries">Decanatos</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Study Offers -->
        <div class="offers">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/study-offers">
                            Ofertas de Estudios
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/undergraduate">
                            Pregrado
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/postgraduate-department">
                            Postgrado
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">
                            Diplomados
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-course/offers">
                            Cursos y Talleres
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Web Services -->
        <div class="webs-service">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="https://portalunimar.unimar.edu.ve/services">
                            Servicios Web
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://portalunimar.unimar.edu.ve/services">
                            Académicos
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://portalunimar.unimar.edu.ve/library">
                            Biblioteca UNIMAR
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title " href="https://www.unimarcientifica.edu.ve/amu/">
                            Educación Virtual
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_blank">
                            Pagos Online
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!-- Quick Access -->
        <div class="quickly-access">
            <div>
                <ul>
                    <li class="footer-item">
                        <a class="footer-title font-weight-bold" href="#">Accesos Rápidos</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/contact-us">Directorio Académico</a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" href="https://portalunimar.unimar.edu.ve/academic-calendar">
                            Calendario Académico
                        </a>
                    </li>
                    <li class="footer-item">
                        <a class="footer-title" style="color: #ffffff !important">Contáctanos a través de</a>
                    </li>
                    <li class="footer-item">
                        <ul class="d-flex justify-content-center list-unstyled">
                            <li class="nav-item px-1">
                                <a href="mailto:info@unimar.edu.ve">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/email.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.facebook.com/share/1CJrXgVUPe/">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/facebook.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.twitter.com/somosunimar">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/gorjeo.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.instagram.com/universidademargarita">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/instagram.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/youtube-03.png">
                                </a>
                            </li>
                            <li class="nav-item px-1">
                                <a href="https://www.linkedin.com/company/univdemargarita">
                                    <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/linkedin.png">
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <!-- Copyright -->
    <div class="copyright-content">
        <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
    </div>
</div>
<!-- /.desktop-footer -->

<!-- Mobile Footer -->
<div class="accordion" id="accordionmobile">
        <!-- Social Media -->
        <div class="content-fluid bg-white" style="background-color: #FFFFFF; border: none;">
            <div class="card-header">
                <div class="rrss">
                    <ul class="d-flex justify-content-around list-unstyled">
                        <li class="nav-item">
                            <a href="mailto:info@unimar.edu.ve">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/email.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.facebook.com/share/1CJrXgVUPe/">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/facebook.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.twitter.com/somosunimar">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/gorjeo.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.instagram.com/universidademargarita">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/instagram.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/./image/rrss/youtube-03.png">
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="https://www.linkedin.com/company/univdemargarita">
                                <img class="w-6 h-6" src="https://portalunimar.unimar.edu.ve/image/rrss/linkedin.png">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Our Institution -->
        <div class="content-fluid">
            <div class="card-header" id="headingOne">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        Nuestra Institución
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseOne" class="collapse text-white" aria-labelledby="headingOne" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/rectorate">Rectorado</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/vicerectorates">Vicerrectorados</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/deaneries">Decanatos</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/student-welfare">Bienestar Estudiantil</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Study Offers -->
        <div class="content-fluid">
            <div class="card-header" id="headingTwo">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Ofertas de Estudios
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseTwo" class="collapse text-white" aria-labelledby="headingTwo" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/undergraduate">
                                Pregrado
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/postgraduate-department">
                                Postgrado
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-diploma/offers">
                                Diplomados
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/extension-course/offers">
                                Cursos y Talleres
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Web Services -->
        <div class="content-fluid">
            <div class="card-header" id="headingThree">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Servicios Web
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseThree" class="collapse text-white" aria-labelledby="headingThree" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title " href="https://portalunimar.unimar.edu.ve/services">
                                Académicos
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title " href="https://portalunimar.unimar.edu.ve/library">
                                Biblioteca UNIMAR
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title " href="https://www.unimarcientifica.edu.ve/amu/">
                                Educación Virtual
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://twitter.com/uniradio_unimar?s=20" target="_blank">
                                Uniradio
                            </a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/service/onlinepayment/inicio" target="_blank">
                                Pagos Online
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- Quick Access -->
        <div class="content-fluid">
            <div class="card-header" id="headingFour">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-white text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                        Accesos Rápidos
                        <span class="fa-sm-x2" style="float: right;">
                            <i class="fas fa-angle-right"></i>
                        </span>
                    </button>
                </h2>
            </div>
            <div id="collapseFour" class="collapse text-white" aria-labelledby="headingFour" data-parent="#accordionmobile">
                <div class="content">
                    <ul>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/contact-us">Directorio Académico</a>
                        </li>
                        <li class="footer-item">
                            <a class="footer-title" href="https://portalunimar.unimar.edu.ve/academic-calendar">
                                Calendario Académico
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- University Logo -->
        <div class="content-fluid">
            <div class="card-header infou">
                <img src="https://portalunimar.unimar.edu.ve/./image/logo-unimar-22.png">
                <span>Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
            </div>
        </div>
        <!-- Copyright -->
        <div class="content-fluid">
            <div class="card-header text-center">
                <span>© Copyright 2001-2025 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.</span>
            </div>
    </div>
</div>
<!-- /.mobile-footer -->

        <!-- /.footer -->

</html>