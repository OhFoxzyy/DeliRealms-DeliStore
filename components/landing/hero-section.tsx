"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSignIcon, View } from "lucide-react";

function AnimatedDRBackground() {
  const drPath =
    "M192,304 C274.5,304 357,304 442,304 C442.33,312.25 442.66,320.5 443,329 C462.47,329 481.94,329 502,329 C502.33,337.25 502.66,345.5 503,354 C512.57,354.33 522.14,354.66 532,355 C532.33,372.16 532.66,389.32 533,407 C537.29,407 541.58,407 546,407 C546,398.42 546,389.84 546,381 C555.57,381 565.14,381 575,381 C574.9690625,377.3184375 574.9690625,377.3184375 574.9375,373.5625 C574.88102952,358.70387687 575.50417832,343.84808866 576,329 C585.9,329 595.8,329 606,329 C606,320.75 606,312.5 606,304 C688.5,304 771,304 856,304 C856,312.25 856,320.5 856,329 C865.9,329 875.8,329 886,329 C886.33,337.58 886.66,346.16 887,355 C896.9,355 906.8,355 917,355 C919.00151512,435.92588856 919.00151512,435.92588856 919.5630188,461.77438354 C919.60367633,463.64428968 919.64489645,465.51418368 919.68673706,467.38406372 C920.03751961,483.1406652 920.24989844,498.81302381 919.20043945,514.54931641 C919.06025227,516.65882341 918.929045,518.76876246 918.79882812,520.87890625 C918.43022268,526.64129046 918.03649843,532.31037753 917,538 C918.32,538 919.64,538 921,538 C921.62257082,550.45419827 922.10543865,562.91155644 922.5,575.375 C922.53060265,576.33951836 922.56120529,577.30403671 922.59273529,578.2977829 C923.78309257,617.2434865 921.86490517,655.80054803 919.125,694.625 C919.07636181,695.3156124 919.02772362,696.0062248 918.97761154,696.71776485 C917.72490377,714.48418811 916.39219601,732.24395516 915,750 C905.76,750 896.52,750 887,750 C886.71196353,756.31159049 886.71196353,756.31159049 886.43188477,762.62353516 C886.39377686,763.42065918 886.35566895,764.2177832 886.31640625,765.0390625 C886.27974854,765.84553223 886.24309082,766.65200195 886.20532227,767.48291016 C885.97075271,770.35854888 885.48716452,773.15733469 885,776 C864.41663162,776.02332721 843.83326541,776.0409783 823.24988651,776.05181217 C813.69336061,776.05697551 804.13684291,776.06401892 794.58032227,776.07543945 C786.25397993,776.08538514 777.92764352,776.09185315 769.60129541,776.09408849 C765.18975143,776.0953958 760.77822443,776.09848288 756.36668587,776.10573006 C752.21929613,776.11248846 748.07193047,776.11461733 743.92453575,776.11310768 C742.3978627,776.11338409 740.87118888,776.11539028 739.34452057,776.11920547 C737.26916541,776.12413994 735.19390258,776.12299923 733.11854553,776.12025452 C731.95432099,776.12117631 730.79009645,776.1220981 729.59059238,776.12304783 C727,776 727,776 726,775 C725.91262355,773.14630389 725.89301847,771.28932459 725.90234375,769.43359375 C725.90484131,768.42095459 725.90733887,767.40831543 725.90991211,766.36499023 C725.92356812,764.42088257 725.92356812,764.42088257 725.9375,762.4375 C725.958125,758.333125 725.97875,754.22875 726,750 C709.83,750 693.66,750 677,750 C676.67,758.58 676.34,767.16 676,776 C633.1,776 590.2,776 546,776 C546,767.42 546,758.84 546,750 C531.81,750 517.62,750 503,750 C502.67,758.58 502.34,767.16 502,776 C400.03,776 298.06,776 193,776 C190.68917841,747.11473007 190.68917841,747.11473007 189.9296875,734.578125 C189.84295439,733.16525737 189.75612927,731.75239538 189.66921997,730.33953857 C189.49123413,727.43641625 189.31504429,724.53319215 189.14013672,721.62988281 C188.91813813,717.94910924 188.69027237,714.26872354 188.46098137,710.58839798 C188.28149177,707.69374986 188.10567292,704.79888698 187.93085098,701.90395355 C187.80909285,699.9006083 187.68389258,697.89747316 187.55856323,695.89434814 C187.08457944,687.91370851 186.92785424,679.99487053 187,672 C179.74,672 172.48,672 165,672 C157.78494049,597.16031602 156.54779304,523.31879381 158.4375,448.1875 C158.47698667,446.60665446 158.47698667,446.60665446 158.51727104,444.99387264 C159.48501703,406.32292413 160.69485512,367.66085513 162,329 C171.9,329 181.8,329 192,329 C192,320.75 192,312.5 192,304 Z M227,339 C286.4,339 345.8,339 407,339 C407,347.58 407,356.16 407,365 C426.8,365 446.6,365 467,365 C467,373.58 467,382.16 467,391 C476.9,391 486.8,391 497,391 C497,408.16 497,425.32 497,443 C506.9,443 516.8,443 527,443 C527,494.81 527,546.62 527,600 C516.77,600 506.54,600 496,600 C496,608.91 496,617.82 496,627 C486.1,627 476.2,627 466,627 C466,635.58 466,644.16 466,653 C385.15,653 304.3,653 221,653 C222.125,576.5 222.125,576.5 223,548 C213.1,548 203.2,548 193,548 C192.96131888,531.88086521 193.0881734,515.77967768 193.40234375,499.6640625 C193.44493435,497.40327219 193.48737559,495.14247906 193.52967834,492.88168335 C193.61819814,488.17744115 193.70827528,483.4732323 193.79956055,478.76904297 C193.91435693,472.84858406 194.02554656,466.92806411 194.1356802,461.00751686 C194.52510157,440.12817363 194.91500153,419.24909521 195.53125,398.375 C195.57011826,397.05666168 195.60898651,395.73832336 195.64903259,394.3800354 C195.95340713,384.57612076 196.41915687,374.79135561 197,365 C206.9,365 216.8,365 227,365 C227,356.42 227,347.84 227,339 Z M641,339 C700.4,339 759.8,339 821,339 C821,347.58 821,356.16 821,365 C831.23,365 841.46,365 852,365 C852,373.58 852,382.16 852,391 C861.9,391 871.8,391 882,391 C882.63349172,397.96840895 883.17524097,404.76871337 883.31640625,411.73828125 C883.33723267,412.64228668 883.35805908,413.54629211 883.3795166,414.47769165 C883.44523673,417.42254814 883.50438312,420.36748428 883.5625,423.3125 C883.58367889,424.32369904 883.60485779,425.33489807 883.62667847,426.3767395 C884.10010077,449.25134909 884.09563617,472.12170406 884,495 C874.1,495 864.2,495 854,495 C854,503.58 854,512.16 854,521 C844.1,521 834.2,521 824,521 C824.33,529.58 824.66,538.16 825,547 C834.9,547 844.8,547 855,547 C855.33,555.58 855.66,564.16 856,573 C865.9,573.33 875.8,573.66 886,574 C886.68061252,591.6959256 887.10864139,609.29145323 887,627 C872.645,627.495 872.645,627.495 858,628 C857.67,636.25 857.34,644.5 857,653 C826.64,653 796.28,653 765,653 C765,644.42 765,635.84 765,627 C754.77,627 744.54,627 734,627 C734,618.09 734,609.18 734,600 C723.77,600 713.54,600 703,600 C703,591.42 703,582.84 703,574 C693.1,574 683.2,574 673,574 C673,591.49 673,608.98 673,627 C663.1,627 653.2,627 643,627 C643,635.91 643,644.82 643,654 C622.54,654.33 602.08,654.66 581,655 C581,645.76 581,636.52 581,627 C571.1,627 561.2,627 551,627 C551,583.44 551,539.88 551,495 C560.9,495 570.8,495 581,495 C581,469.26 581,443.52 581,417 C590.9,417 600.8,417 611,417 C611,399.84 611,382.68 611,365 C620.9,365 630.8,365 641,365 C641,356.42 641,347.84 641,339 Z";

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
        <svg
          viewBox="0 0 1080 1080"
          className="w-full h-full max-w-4xl max-h-4xl"
        >
          <path
            d={drPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
          />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] dark:opacity-[0.15]">
        <svg
          viewBox="0 0 1080 1080"
          className="w-full h-full max-w-4xl max-h-4xl"
        >
          <defs>
            <radialGradient id="glow-spot">
              <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="path-gradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="30%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="70%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d={drPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-foreground traveling-light"
            style={{
              filter: "blur(1px) drop-shadow(0 0 3px currentColor)",
            }}
          />
        </svg>
      </div>

      <style jsx>{`
        .traveling-light {
          stroke-dasharray: 150 10000;
          animation: dash-travel 12s linear infinite;
        }

        @keyframes dash-travel {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -10150;
          }
        }
      `}</style>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <AnimatedDRBackground />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 text-sm">
          <DollarSignIcon className="h-4 w-4 text-lime-600" />
          <span className="text-muted-foreground">
            Start earning revenue now
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
          Earn Faster,
          <br />
          <span className="bg-linear-to-r from-lime-600 to-lime-700 bg-clip-text text-transparent">
            Build Smarter
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          A real-time store builder, fast in-game delivery, Skript support, and
          documentation for full control over purchases, players, and rewards.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/signin">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto bg-transparent"
          >
            <Link href="https://github.com">
              <View className="mr-2 h-4 w-4" />
              View Demo
            </Link>
          </Button>
        </div>

        {/* Social Proof Badges */}
        <div className="flex flex-col items-center pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by developers worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">100+</span>
              <span className="text-muted-foreground">Deployments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">150+</span>
              <span className="text-muted-foreground">Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">99.9%</span>
              <span className="text-muted-foreground">Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
