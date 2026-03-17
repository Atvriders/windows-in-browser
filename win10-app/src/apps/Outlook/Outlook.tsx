import { useState, useRef } from 'react';
import './Outlook.css';

interface Email { id: number; from: string; subject: string; preview: string; body: string; time: string; read: boolean; folder: string; }

const FOLDER_DEFS = [
  { name: 'Inbox', icon: '📥' },
  { name: 'Sent', icon: '📤' },
  { name: 'Drafts', icon: '📝' },
  { name: 'Junk', icon: '🗑' },
  { name: 'Deleted', icon: '❌' },
];

const SPAM_SENDERS = [
  'Mega-Prizes <noreply@win-prizes-now.com>','Free Gift Card <giftcard@claim-reward.net>','Amazon Winner <amazon-winner@amaz0n-gifts.xyz>',
  'Apple Support <support@apple-id-verify.ru>','PayPal Security <security@paypa1-secure.net>','Microsoft Alert <alert@micros0ft-support.org>',
  'Bank of America <verify@boa-securelogin.xyz>','Chase Security <noreply@chase-verify.net>','Crypto Wealth <invest@bitcoin-profits2026.com>',
  'Lottery Commission <winner@nationallottery.ng>','Prize Department <claim@1millionprize.win>','Shopping Reward <reward@freegiftcards.win>',
  'Health Miracle <offer@miracle-pills-cheap.ru>','Insurance Alert <alert@cheapinsurance2026.xyz>','Job Offer <jobs@work-from-home-4000aweek.com>',
  'IRS Department <refund@irs-gov-refund.xyz>','Inheritance Fund <lawyer@inheritance-funds.ng>','Dating Site <matches@meet-singles-now.com>',
  'Weight Loss Secret <offer@lose30lbs-fast.net>','Tech Support <help@windows-error-fix.com>','Norton Security <alert@norton-renew.xyz>',
  'McAfee Alert <renew@mcafee-protection.net>','Bank Wire <transfer@securebanktransfer.com>','USPS Delivery <delivery@usps-parcel-hold.xyz>',
  'FedEx Alert <shipment@fedex-delivery-hold.net>','DHL Notice <parcel@dhl-customs-fee.com>','Government Grant <grant@free-government-money.net>',
  'Social Security <alert@ssa-verify-now.xyz>','Medicare Update <update@medicare-card-renewal.com>','Student Loan Forgiveness <apply@studentloan-forgiven.net>',
  'Energy Bill Rebate <rebate@utility-refund-claim.com>','Home Security Deal <offer@homesecurity-free-install.net>','Car Warranty <warranty@extended-auto-coverage.com>',
  'Timeshare Escape <help@timeshare-exit-now.com>','Reverse Mortgage <info@reverse-mortgage-seniors.net>','Free Vacation <winner@vacation-resort-prize.com>',
  'Unclaimed Package <notice@unclaimed-parcel-fee.xyz>','Netflix Suspended <billing@netf1ix-billing-update.com>','Spotify Premium <alert@sp0tify-payment-failed.net>',
  'Zelle Alert <payment@zelle-security-notice.com>','Venmo Security <alert@venm0-verify.net>','Cash App <cashout@cashapp-bonus-claim.com>',
  'Steam Account <alert@steam-account-suspended.xyz>','Epic Games <free@epicgames-free-vbucks.net>','Roblox Robux <free@roblox-free-robux.win>',
];

const SPAM_SUBJECTS = [
  'YOU HAVE WON a $1,000,000 gift card — CLAIM NOW!!!',
  'URGENT: Your account has been suspended — verify immediately',
  'Congratulations! You are our LUCKY WINNER today!',
  'FREE iPhone 16 Pro MAX — Limited time, claim yours!',
  'Your package is being held — pay $2.99 customs fee',
  'ALERT: Unauthorized login attempt on your account',
  'You\'ve been selected for a FREE home security system',
  'Make $5,000/week from home — no experience needed!',
  'Your computer has a VIRUS — call 1-800-555-HELP now',
  'FINAL NOTICE: Your subscription will be cancelled',
  'Claim your $500 Amazon gift card before it expires!',
  'BITCOIN INVESTMENT: Turn $100 into $10,000 in 30 days',
  'Your Social Security number has been compromised!',
  'FREE trial: Lose 30 lbs in 30 days — doctors hate this!',
  'You\'ve inherited $2.3M from a distant relative',
  'LAST CHANCE: Renew your Norton protection NOW',
  'Exclusive: Government grant — $17,500 you never repay',
  'Hot singles in your area are waiting to meet you!',
  'Your Netflix payment failed — update billing NOW',
  'FREE Walmart gift card — take this 30-second survey',
  'ACTION REQUIRED: Verify your PayPal account immediately',
  'You could qualify for $0 health insurance premiums!',
  'Elon Musk\'s secret crypto investment revealed!',
  'Your car warranty is expiring — extend coverage today',
  'Unclaimed government stimulus check — your $1,400 awaits',
  'CONGRATULATIONS! You have been selected for $10,000!',
  'Microsoft detected errors on your PC — fix now!',
  'Student loan FORGIVEN — apply before the deadline!',
  'Singles near you viewed your profile 47 times today',
  'Claim your FREE Rolex watch — today only!',
  'IRS: You owe back taxes — immediate payment required',
  'Your Amazon Prime membership needs to be renewed',
  'BREAKING: New pill eliminates type 2 diabetes overnight',
  'You\'ve been chosen for our exclusive rewards program!',
  'Reverse aging: 78-year-old looks 30 with this trick',
  'FREE solar panels — government pays 100% of the cost',
  'Your Chase account has been locked — unlock it now',
  'GRANDCHILD EMERGENCY: Please wire money immediately',
  'Earn $300/day stuffing envelopes from home!',
  'FINAL WARNING: Your email account will be closed',
  'Get out of debt INSTANTLY — $30,000 erased overnight',
  'Your DHL package requires customs clearance fee',
  'CASH PRIZE: $250,000 check is ready for you!',
  'Doctors are FURIOUS about this natural remedy',
  'You have 48 hours to claim your inheritance!',
  'FREE VPN — protect your identity today!',
  'URGENT: Update your banking information now',
  'Celebrity weight loss secret REVEALED — try for free',
  'EXCLUSIVE: Make $10k/month with this secret method',
  'Your computer has been blocked — call immediately!',
];

const SPAM_MONTHS = ['Jan', 'Feb', 'Mar', 'Dec', 'Nov', 'Oct'];
const SPAM_DAYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

function generateSpam(): Email[] {
  const result: Email[] = [];
  for (let i = 0; i < 500; i++) {
    const sender = SPAM_SENDERS[i % SPAM_SENDERS.length];
    const subject = SPAM_SUBJECTS[i % SPAM_SUBJECTS.length];
    const month = SPAM_MONTHS[i % SPAM_MONTHS.length];
    const day = SPAM_DAYS[i % SPAM_DAYS.length];
    result.push({
      id: 1000 + i,
      from: sender,
      subject: subject,
      preview: `${subject.slice(0, 55)}...`,
      body: `[Spam/Scam email — automatically filtered to Junk]\n\nFrom: ${sender}\nSubject: ${subject}\n\nThis message was identified as spam and moved to Junk. Do not click any links or provide personal information.`,
      time: `${month} ${day}`,
      read: i > 2,
      folder: 'Junk',
    });
  }
  return result;
}

const INITIAL_EMAILS: Email[] = [
  // INBOX — unread
  { id: 1, from: 'Microsoft Team', subject: 'Welcome to Outlook!', preview: 'Thank you for using Microsoft Outlook...', body: 'Thank you for using Microsoft Outlook!\n\nThis is your inbox. You can read, compose, and manage your emails here. Outlook helps you stay connected with people and on top of important information.\n\nBest regards,\nThe Microsoft Team', time: '9:41 AM', read: false, folder: 'Inbox' },
  { id: 2, from: 'GitHub <no-reply@github.com>', subject: '⭐ Your repo windows-in-browser was starred', preview: 'Someone starred your repository windows-in-browser...', body: 'Someone starred your repository!\n\nwindows-in-browser has been starred by a user.\n\nVisit https://github.com/Atvriders/windows-in-browser to see the activity.', time: '8:12 AM', read: false, folder: 'Inbox' },
  { id: 3, from: 'LinkedIn', subject: 'You have 12 new profile views this week', preview: 'Your profile is getting noticed. See who viewed...', body: 'Your LinkedIn Profile\n\nYou had 12 profile views this week — up 34% from last week.\n\n📈 Your profile appeared in 87 search results\n✉️ You have 3 pending connection requests\n💼 8 new job recommendations matching your skills\n\nLog in to see the details.', time: '7:30 AM', read: false, folder: 'Inbox' },
  { id: 4, from: 'Amazon <shipment-tracking@amazon.com>', subject: 'Your order has shipped!', preview: 'Your order #114-7823901-4512345 has shipped...', body: 'Hello,\n\nYour order has shipped!\n\nOrder #114-7823901-4512345\n- Logitech MX Master 3S Mouse (Graphite)\n- Qty: 1\n\nEstimated delivery: Tomorrow by 8 PM\nTracking: 1Z999AA10123456784\n\nThank you for shopping with Amazon!', time: '6:58 AM', read: false, folder: 'Inbox' },
  { id: 5, from: 'IT Department <it@company.com>', subject: 'System Maintenance Tonight 10PM–2AM', preview: 'Please save your work before 10pm...', body: 'Hello,\n\nScheduled system maintenance will occur tonight from 10:00 PM to 2:00 AM.\n\nAffected systems:\n- VPN Gateway (vpn.company.com)\n- Internal Wiki\n- Dev build servers (build01–build04)\n\nPlease save all work and disconnect from VPN before 10 PM.\n\nThank you,\nIT Operations', time: 'Yesterday', read: true, folder: 'Inbox' },
  { id: 6, from: 'HR Team <hr@company.com>', subject: 'Q1 Performance Review — Action Required', preview: 'Your Q1 performance review is scheduled for...', body: 'Hi,\n\nYour Q1 performance review has been scheduled for next Friday, March 22, at 2:00 PM in Conference Room B.\n\nPlease complete your self-assessment in Workday before the meeting:\n1. Log in to workday.company.com\n2. Navigate to Performance → Self-Assessment\n3. Complete all sections by March 20\n\nQuestions? Reply to this email.\n\nBest,\nHR Team', time: 'Mon', read: true, folder: 'Inbox' },
  { id: 7, from: 'Jira <jira@atlassian.net>', subject: '[PROJECT-4821] Bug: Dark mode flicker on startup — Assigned to you', preview: 'Alex Chen assigned a bug to you in PROJECT...', body: 'Alex Chen assigned an issue to you.\n\nIssue: PROJECT-4821\nType: Bug\nPriority: High\nSummary: Dark mode flicker visible for ~200ms on app startup\n\nDescription:\nWhen dark mode is enabled, the app briefly shows light mode colors before applying the theme. Affects all platforms.\n\nSteps to reproduce:\n1. Enable dark mode\n2. Kill and restart the app\n3. Observe white flash before theme loads\n\nView issue: https://jira.company.com/browse/PROJECT-4821', time: 'Mon', read: true, folder: 'Inbox' },
  { id: 8, from: 'Slack <feedback@slack.com>', subject: 'New message in #engineering from Alex', preview: '"Hey, the staging build is failing — anyone else seeing..."', body: 'You have a new mention in Slack.\n\n#engineering\nAlex Chen: @user Hey, the staging build is failing — anyone else seeing this? build04 is returning 503s on /api/health.\n\nOpen Slack to reply.', time: 'Mon', read: true, folder: 'Inbox' },
  { id: 9, from: 'Notion <team@makenotion.com>', subject: 'Alex shared "Q2 Roadmap" with you', preview: 'Alex Chen shared a page with you in your workspace...', body: 'Alex Chen shared a page with you.\n\n📄 Q2 Roadmap — Product Team\n\nYou can now view and comment on this page.\n\nOpen Notion to view it.', time: 'Sun', read: true, folder: 'Inbox' },
  { id: 10, from: 'GitHub <no-reply@github.com>', subject: '[windows-in-browser] New issue opened by user42', preview: 'Issue #47: Start menu keyboard navigation...', body: 'A new issue has been opened.\n\nRepo: Atvriders/windows-in-browser\nIssue #47: Start menu keyboard navigation not working\n\n"When using arrow keys in the Start Menu, focus doesn\'t move between items. Expected: arrow keys navigate between pinned tiles and app list items."\n\nLabel: enhancement\nOpened by: user42\n\nView issue on GitHub.', time: 'Sun', read: true, folder: 'Inbox' },
  { id: 11, from: 'Netflix <info@mailer.netflix.com>', subject: 'New releases this week you\'ll love', preview: 'Based on your watch history, check out these new titles...', body: 'New this week on Netflix\n\nBased on your watch history:\n\n🎬 The Diplomat: Season 2 — Now streaming\n🎬 Black Mirror: Season 7 — Now streaming\n🎬 Adolescence — Original series\n🎬 Ripley — Now streaming\n\nLog in to start watching.', time: 'Sat', read: true, folder: 'Inbox' },
  { id: 12, from: 'Steam <noreply@steampowered.com>', subject: 'Your wishlist item is on sale: Elden Ring (60% off)', preview: 'Elden Ring is on sale for $23.99 — 60% off...', body: 'A game on your wishlist is on sale!\n\n🎮 Elden Ring\nOriginal: $59.99\nSale Price: $23.99 (60% off)\nSale ends: March 21, 2026\n\nYou also have 47 other items on your wishlist. Log in to Steam to see all active sales.', time: 'Sat', read: true, folder: 'Inbox' },
  { id: 13, from: 'Sarah Mitchell <sarah.mitchell@gmail.com>', subject: 'Re: Weekend hiking plans', preview: 'Sounds perfect! I\'ll bring the trail mix and water...', body: 'Sounds perfect! I\'ll bring the trail mix and water purification tablets. Do you think we should take the north or south trailhead?\n\nAlso — are we car pooling? I can drive if you cover parking.\n\n— Sarah\n\n> On Mar 14, you wrote:\n> Thinking Saturday morning, early start around 7am.\n> The weather looks clear and highs around 62°F. You in?', time: 'Fri', read: true, folder: 'Inbox' },
  { id: 14, from: 'Vercel <no-reply@vercel.com>', subject: 'Deployment failed: windows-in-browser (main)', preview: 'Build failed with 3 TypeScript errors...', body: 'Your deployment failed.\n\nProject: windows-in-browser\nBranch: main\nCommit: 3f8a2c1 "Add VLC open file support"\n\nBuild output (last 10 lines):\nsrc/apps/VLC/VLC.tsx:65:24 - error TS2532: Object is possibly undefined\n...\n\nBuild duration: 43s\nFailed at: TypeScript compilation\n\nView full build log on Vercel.', time: 'Fri', read: true, folder: 'Inbox' },
  { id: 15, from: 'Figma <no-reply@figma.com>', subject: 'Jordan left a comment on "App UI v3"', preview: '"The padding here feels inconsistent with the rest of the..."', body: 'Jordan Lee commented on your Figma file.\n\nFile: App UI v3\nFrame: Settings > Account\n\nComment:\n"The padding here feels inconsistent with the rest of the design — should this be 16px like the other panels or 24px? Also, the font size on the subtitle looks like it might be 13px instead of 14px."\n\nReply in Figma.', time: 'Thu', read: true, folder: 'Inbox' },
  { id: 16, from: 'AWS Billing <billing@amazon.com>', subject: 'AWS Invoice for February 2026 — $47.23', preview: 'Your AWS invoice is ready. Total: $47.23...', body: 'Your AWS Invoice is ready.\n\nAccount ID: 123456789012\nInvoice Period: February 1–28, 2026\nTotal Amount: $47.23\n\nService breakdown:\n- EC2: $31.40 (t3.small, us-east-1)\n- S3: $8.75 (47 GB storage + requests)\n- CloudFront: $4.12\n- Route 53: $2.96\n\nPayment will be charged to your credit card on file.\n\nView invoice in AWS Console.', time: 'Thu', read: true, folder: 'Inbox' },
  { id: 17, from: 'Cloudflare <no-reply@notify.cloudflare.com>', subject: 'DDoS attack detected and mitigated on your domain', preview: 'An attack was automatically mitigated on yourdomain.com...', body: 'Cloudflare has automatically mitigated an attack on your domain.\n\nDomain: yourdomain.com\nAttack type: HTTP flood (Layer 7)\nPeak requests: 47,000 req/s\nDuration: 4 minutes 22 seconds\nStatus: Mitigated — no impact to visitors\n\nAll traffic was automatically filtered. No action required.\n\nView the Security dashboard in Cloudflare.', time: 'Wed', read: true, folder: 'Inbox' },
  { id: 18, from: 'mom <janemiller@hotmail.com>', subject: 'Re: Thanksgiving plans', preview: 'We were thinking of coming down that Wednesday evening...', body: 'We were thinking of coming down that Wednesday evening if that works for you! Your father wants to do a turkey AND a ham this year (don\'t ask me why, you know how he is).\n\nCan you pick up the rolls from that bakery you like? Last year\'s were so good.\n\nLove you ❤️\nMom\n\n> On Mar 12, you wrote:\n> Planning to host this year if that works for everyone!', time: 'Wed', read: true, folder: 'Inbox' },
  { id: 19, from: 'Hacker News Digest <hn-digest@hndigest.com>', subject: 'HN Daily: AI coding tools, Firefox 134, new Rust features', preview: 'Top stories from Hacker News for March 15...', body: 'Hacker News Daily Digest — March 15, 2026\n\n1. Show HN: I built a full Windows 10 simulation in React (2,847 points)\n2. Firefox 134 released with Temporal API support (1,204 points)\n3. Rust 1.88 stabilizes async closures (987 points)\n4. Why I stopped using Docker for local dev (856 points)\n5. GPT-5 technical report released (743 points)\n6. The death of the 10x engineer myth (612 points)\n7. Ask HN: What\'s your terminal setup in 2026? (589 points)', time: 'Tue', read: true, folder: 'Inbox' },
  { id: 20, from: 'Jordan Lee <jordan.lee@company.com>', subject: 'Quick question about the API rate limits', preview: 'Hey, do you know off the top of your head if we\'re on the...', body: 'Hey,\n\nDo you know off the top of your head if we\'re on the Pro or Enterprise tier for the OpenAI API? I\'m trying to figure out if we can increase the rate limit for the inference pipeline without going to enterprise pricing.\n\nAlso — did you see the Jira ticket Alex assigned to you? That dark mode bug has been in the backlog for two sprints, I think Sarah wants it closed before the Q1 wrap.\n\nJordan', time: 'Tue', read: true, folder: 'Inbox' },
  { id: 21, from: 'Patreon <no-reply@patreon.com>', subject: 'Your creator earned $1,240 in February', preview: 'Here\'s your monthly earnings summary from Patreon...', body: 'Your February Earnings Summary\n\nGross earnings: $1,520.00\nPlatform fee (8%): -$121.60\nPayment processing: -$158.40\nNet payout: $1,240.00\n\nPatrons this month: 94 (↑8 from January)\nNew patrons: 14\nChurned patrons: 6\n\nPayout was deposited to your linked bank account.\n\nThank you for creating on Patreon!', time: 'Mon', read: true, folder: 'Inbox' },
  { id: 22, from: 'Spotify <no-reply@spotify.com>', subject: 'Your Spotify Wrapped is here! 🎵', preview: 'You listened to 47,892 minutes of music this year...', body: 'Your 2025 Spotify Wrapped!\n\n🎵 47,892 minutes listened\n🎤 Top artist: Tame Impala\n💿 Top album: The Slow Rush\n🎶 Top song: The Less I Know The Better\n🌍 You were in the top 0.01% of Tame Impala listeners\n\n#1 genre: Psychedelic Rock\n\nSee your full Wrapped in the Spotify app!', time: 'Dec 4', read: true, folder: 'Inbox' },
  { id: 23, from: 'Alex Chen <alex.chen@company.com>', subject: 'Code review — PR #312 Feedback', preview: 'Left some comments on the PR, mostly minor things...', body: 'Hey,\n\nLeft some comments on PR #312. Mostly minor things:\n\n1. Line 247 in FileExplorer.tsx — the useEffect dependency array is missing `currentId`. Could cause stale closure bugs.\n2. The `getPath()` helper in FilePicker has an implicit `any` that TypeScript strict would flag.\n3. Nit: the comment on line 89 is outdated, refers to old API.\n\nOtherwise looks good — nice work on the VLC HH:MM:SS duration fix, I was going to file that as a bug.\n\nApproved with minor changes.\n\nAlex', time: 'Yesterday', read: true, folder: 'Inbox' },
  { id: 24, from: 'DigitalOcean <support@digitalocean.com>', subject: 'Action required: Your droplet is approaching CPU limits', preview: 'Your droplet app-server-01 has been above 90% CPU for 2 hours...', body: 'Resource Alert\n\nDroplet: app-server-01 (NYC3)\nIP: 198.51.100.42\nAlert: CPU usage > 90% for 2+ hours\nCurrent CPU: 94.2%\n\nYour droplet has been under heavy load. Consider:\n- Upgrading to a larger droplet\n- Optimizing your application\n- Adding a load balancer\n\nIf this is unexpected, check for runaway processes.\n\nManage your droplet in the DigitalOcean console.', time: 'Mar 10', read: true, folder: 'Inbox' },
  { id: 25, from: 'Reddit <noreply@reddit.com>', subject: 'r/programming — your post reached 1,000 upvotes!', preview: '"Show HN / Show Reddit: I built a Windows 10 simulation..." is trending...', body: 'Your post is trending!\n\nSubreddit: r/programming\nPost: "I spent 3 months building a full Windows 10 simulation in React — it runs in the browser with no backend"\n\n🔼 1,247 upvotes\n💬 183 comments\n🏆 Gold award received\n\nTop comment: "The attention to detail here is insane. The VLC playlist, the fake Wireshark packets, the battery drain simulation — this is incredible."\n\nView your post on Reddit.', time: 'Mar 9', read: true, folder: 'Inbox' },
  { id: 26, from: 'Google <accounts-noreply@accounts.google.com>', subject: 'Security alert: New sign-in on Windows', preview: 'Your Google account was used to sign in on Windows...', body: 'Security Alert\n\nA new sign-in to your Google Account\n\nDevice: Windows PC\nLocation: New York, NY, USA\nTime: March 9, 2026 at 8:14 AM EST\n\nIf this was you, you can ignore this message.\n\nIf this wasn\'t you, secure your account immediately at myaccount.google.com/security.', time: 'Mar 9', read: true, folder: 'Inbox' },
  { id: 27, from: 'DockerHub <noreply@hub.docker.com>', subject: 'Action required: Rate limit changes starting April 1', preview: 'Anonymous pulls will be limited to 10 per hour starting...', body: 'Important: Docker Hub Rate Limit Changes\n\nStarting April 1, 2026:\n- Anonymous pulls: 10/hour (down from 100)\n- Free accounts: 200 pulls/6 hours\n- Pro accounts: Unlimited\n\nIf you\'re using Docker Hub in CI/CD pipelines without authentication, you may see build failures.\n\nWe recommend authenticating with a Docker Hub account in your CI configuration.\n\nSee our documentation for details.', time: 'Mar 8', read: true, folder: 'Inbox' },
  { id: 28, from: 'Coinbase <no-reply@coinbase.com>', subject: 'Price alert: Bitcoin reached $89,420', preview: 'Bitcoin has crossed your alert threshold of $85,000...', body: 'Price Alert Triggered\n\nBitcoin (BTC) has reached $89,420.00\n\nYour alert was set for: $85,000.00\nCurrent price: $89,420.00\n24h change: +4.7%\n\nThis is not financial advice. Past performance does not guarantee future results.\n\nView your portfolio on Coinbase.', time: 'Mar 7', read: true, folder: 'Inbox' },
  { id: 29, from: 'Stack Overflow <noreply@stackoverflow.com>', subject: 'Your answer was accepted and earned you 15 reputation', preview: 'Your answer to "How to fix HH:MM:SS duration parsing in React..." was accepted...', body: 'Your answer was accepted!\n\nQuestion: "How to properly parse HH:MM:SS duration strings in React when parts can be 2 or 3 segments?"\n\nYour answer:\n```javascript\nconst parseDuration = (dur) => {\n  const parts = dur.split(\':\').map(Number);\n  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];\n  return parts[0]*60 + parts[1];\n};\n```\n\n+15 reputation earned\nTotal reputation: 3,847\n\nView your answer on Stack Overflow.', time: 'Mar 6', read: true, folder: 'Inbox' },
  { id: 30, from: 'Plex <no-reply@plex.tv>', subject: 'New content added to your Plex library', preview: 'Dune: Part Two, Oppenheimer, and 14 more have been added...', body: 'New content added to your library!\n\nNew movies (14):\n• Dune: Part Two (4K HDR)\n• Oppenheimer (4K HDR)\n• Poor Things\n• Past Lives\n• Killers of the Flower Moon\n• The Zone of Interest\n• ...and 8 more\n\nNew TV episodes (23):\n• The Bear: Season 3, Episodes 1-8\n• Dark: Season 2, Episode 4\n• ...and 14 more\n\nOpen Plex to start watching.', time: 'Mar 5', read: true, folder: 'Inbox' },

  // SENT
  { id: 100, from: 'Me', subject: 'Re: Q1 Review Scheduled', preview: 'Confirmed, I\'ll have the self-assessment done by Thursday...', body: 'Hi,\n\nConfirmed — I\'ll have the self-assessment completed in Workday by Thursday the 20th.\n\nSee you Friday at 2 PM in Conference Room B.\n\nThanks,\nUser', time: '10:02 AM', read: true, folder: 'Sent' },
  { id: 101, from: 'Me', subject: 'Re: Weekend hiking plans', preview: 'Let\'s take the north trailhead, it has better views at the top...', body: 'Let\'s take the north trailhead — it\'s a bit harder but the views at the summit are worth it. I\'ll drive, you cover parking sounds fair.\n\nSee you Saturday at 7am at my place?\n\n—', time: 'Fri', read: true, folder: 'Sent' },
  { id: 102, from: 'Me', subject: 'Re: Code review — PR #312 Feedback', preview: 'Thanks for the review! Fixed all three points. The useEffect...', body: 'Thanks for the review, Alex!\n\nFixed all three:\n1. Added `currentId` to the useEffect dep array\n2. Added explicit type annotation to getPath() — used `{ name: string; parentId: string | null }` to avoid importing an unused type\n3. Removed the outdated comment on line 89\n\nForce-pushed to the same branch. Should be good to merge now.\n\nThanks again!', time: 'Yesterday', read: true, folder: 'Sent' },
  { id: 103, from: 'Me', subject: 'Re: Quick question about the API rate limits', preview: 'We\'re on Pro tier, so rate limits are 3,500 RPM. Should be...', body: 'Hey Jordan,\n\nWe\'re on Pro tier — 3,500 RPM and 90,000 TPM. That should be plenty for the inference pipeline unless you\'re running parallel batches > 50.\n\nIf it becomes a bottleneck, ping me and we can look at batching strategy before going Enterprise.\n\nRe: the Jira ticket — yeah I saw it. On my list for this sprint.\n\n—', time: 'Tue', read: true, folder: 'Sent' },
  { id: 104, from: 'Me', subject: 'Hey — deployed the Windows 10 sim!', preview: 'Finally pushed it live. It\'s at the GitHub link below. Would love...', body: 'Hey,\n\nFinally deployed the Windows 10 browser simulation I\'ve been working on for the past few months!\n\nRepo: https://github.com/Atvriders/windows-in-browser\nLive demo: coming soon\n\nBuilt in React 18 + TypeScript + Zustand. No backend. All sounds are synthesized via Web Audio API — no audio files.\n\nWould love your feedback.\n\n—', time: 'Mar 10', read: true, folder: 'Sent' },
  { id: 105, from: 'Me', subject: 'AWS cost optimization ideas', preview: 'I looked through our February invoice and found a few areas...', body: 'Hey,\n\nI looked through our February AWS invoice ($47.23) and found a few areas to optimize:\n\n1. The t3.small EC2 instance ($31.40) is sitting at <5% CPU most of the time. Switching to a t4g.small (ARM) would save ~25%.\n2. S3 storage is growing 4GB/month — we should add a lifecycle rule to move objects older than 90 days to Glacier.\n3. Some CloudFront requests are not cached (Cache-Control headers missing) — fixing that would reduce origin requests.\n\nEstimated savings: ~$12-15/month.\n\nLet me know if you want me to implement any of these.\n\n—', time: 'Mar 8', read: true, folder: 'Sent' },
  { id: 106, from: 'Me', subject: 'Stack Overflow answer: HH:MM:SS parsing', preview: 'I answered the question about duration string parsing. The...', body: 'Answered the SO question about HH:MM:SS parsing. The key insight is to check the number of segments:\n\n```javascript\nconst parseDuration = (dur) => {\n  const parts = dur.split(\':\').map(Number);\n  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];\n  return parts[0]*60 + parts[1];\n};\n```\n\nFunny enough, I fixed this exact bug in my own code the same day.\n\n—', time: 'Mar 6', read: true, folder: 'Sent' },
  { id: 107, from: 'Me', subject: 'Re: Thanksgiving plans', preview: 'Wednesday evening works great! I\'ll grab the rolls from that...', body: 'Wednesday evening works great! I\'ll grab the rolls from the bakery on Main Street — they have a sourdough pull-apart that would be perfect.\n\nTell Dad I support the turkey AND ham decision enthusiastically.\n\nLove you both ❤️', time: 'Wed', read: true, folder: 'Sent' },
  { id: 108, from: 'Me', subject: 'Deployment rollback note', preview: 'Rolling back to v1.4.2 — the v1.5.0 build has a runtime error...', body: 'Rolling back to v1.4.2.\n\nThe v1.5.0 build introduced a runtime error in the FileExplorer when opening NAS drives with paths containing spaces. It\'s throwing on `getPath()` when parentId is null at the root level.\n\nFix is in progress. ETA: 2 hours.\n\nVercel rollback: https://vercel.com/atvriders/windows-in-browser/deployments\n\n—', time: 'Fri', read: true, folder: 'Sent' },

  // DRAFTS
  { id: 200, from: 'Me', subject: 'Q2 Feature Proposal: Virtual Terminal with SSH simulation', preview: 'I want to propose adding an SSH client simulation that connects to...', body: 'Q2 Feature Proposal\n\nVirtual SSH Terminal\n\nI want to add an SSH client app to the Windows browser simulation. It would simulate connecting to known hosts (the NAS IPs, a fake dev server, etc.) and support:\n\n- ssh user@192.168.1.105\n- Simulated shell with ls, cat, top, systemctl\n- ~/.ssh/known_hosts in the virtual filesystem\n- Realistic latency simulation\n\nEstimated effort: 2–3 days\n\n[DRAFT — not sent]', time: 'Today', read: true, folder: 'Drafts' },
  { id: 201, from: 'Me', subject: 'Follow-up: Hiking Saturday', preview: 'Hey Sarah — just checking in, are we still on for Saturday?...', body: 'Hey Sarah,\n\nJust checking in — still on for Saturday? Weather is looking even better now, highs around 65°F and no wind.\n\nI\'m planning to leave by 6:45 to get there by 7.\n\n[DRAFT — not sent]', time: 'Today', read: true, folder: 'Drafts' },
  { id: 202, from: 'Me', subject: 'Blog post draft: Building a Windows 10 simulation in React', preview: 'After three months of evenings and weekends, I shipped something...', body: 'Blog Post Draft\n\n# Building a Windows 10 Simulation in React\n\nAfter three months of evenings and weekends, I shipped something I\'m genuinely proud of: a full Windows 10 desktop simulation that runs entirely in the browser.\n\nNo backend. No VM. No Electron. Just React 18, TypeScript, Zustand, and some creative use of the Web Audio API.\n\n## Why?\n\nI wanted to push the limits of what a pure browser app could feel like. Modern browsers are incredibly powerful — canvas rendering, audio synthesis, localStorage persistence, ResizeObserver — there\'s so much available that most apps barely scratch.\n\n## What\'s in it\n\n- 45+ working apps including Photoshop, VLC, Discord, Steam...\n\n[DRAFT — not finished]', time: 'Mar 14', read: true, folder: 'Drafts' },

  // JUNK — handcrafted
  { id: 300, from: 'Nigerian Prince <prince@royalfunds.ng>', subject: 'URGENT: Your assistance needed for fund transfer — $4.5M', preview: 'Dear Friend, I am Prince Abubakar and I need your help to transfer...', body: 'Dear Friend,\n\nI am Prince Abubakar, son of the late King of Lagos. I have USD $4,500,000 that I need to transfer out of the country urgently.\n\nI am seeking a trusted partner. You will receive 30% of the total sum.\n\nPlease send your bank details and phone number to proceed.\n\nGod bless you,\nPrince Abubakar', time: 'Mar 15', read: false, folder: 'Junk' },
  { id: 301, from: 'IRS-Refund <irs-refund@tax-gov-refund.xyz>', subject: 'TAX REFUND: $3,847.00 PENDING CLAIM', preview: 'Your federal tax refund of $3,847.00 is waiting. Click here to...', body: 'URGENT TAX REFUND NOTICE\n\nThe IRS has processed your 2025 tax return.\nRefund Amount: $3,847.00\n\nTo claim your refund, you must verify your identity by providing:\n- Social Security Number\n- Bank routing number\n- Date of birth\n\nClick the secure link below within 48 hours or forfeit your refund.\n\n[THIS IS A PHISHING ATTEMPT — do not click any links]', time: 'Mar 14', read: false, folder: 'Junk' },
  { id: 302, from: 'PHARMACY-ONLINE <deals@bestpillsfast.ru>', subject: 'V1AGRA, C1ALIS — No prescription needed — 80% OFF!!!', preview: 'Our online pharmacy offers the best prices on...', body: '[Spam email — filtered to Junk]', time: 'Mar 13', read: true, folder: 'Junk' },
  { id: 303, from: 'CryptoMillions <invest@crypto-millions-2026.com>', subject: 'Elon Musk ENDORSES this new crypto — 10,000% gains guaranteed', preview: 'BITCOIN MILLIONAIRE SECRETS revealed. Invest just $250 today and...', body: '[Spam email — filtered to Junk]', time: 'Mar 12', read: true, folder: 'Junk' },
  { id: 304, from: 'WINNER NOTIFICATION <sweepstakes@freegifts.win>', subject: 'YOU HAVE BEEN SELECTED — Claim your FREE iPhone 16 Pro', preview: 'Congratulations! You are our 1,000,000th visitor and have been selected...', body: '[Spam email — filtered to Junk]', time: 'Mar 11', read: true, folder: 'Junk' },
  ...generateSpam(),

  // DELETED
  { id: 400, from: 'Zoom <no-reply@zoom.us>', subject: 'Recording available: Weekly Team Standup (Mar 10)', preview: 'Your Zoom meeting recording is now available...', body: 'Your meeting recording is ready.\n\nMeeting: Weekly Team Standup\nDate: March 10, 2026\nDuration: 32 minutes\n\nRecording expires in 30 days.\n\nView recording in Zoom.', time: 'Mar 10', read: true, folder: 'Deleted' },
  { id: 401, from: 'Grammarly <hello@grammarly.com>', subject: 'Your weekly writing stats', preview: 'You wrote 4,721 words this week...', body: 'Your Grammarly Week in Review\n\nWords written: 4,721\nGrammarly suggestions: 34\nAccuracy score: 98\nClarity score: 94\n\nMost active day: Tuesday\nMost active app: VS Code\n\nKeep writing!', time: 'Mar 9', read: true, folder: 'Deleted' },
];

let nextId = 500;

export default function Outlook() {
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [selected, setSelected] = useState<Email | null>(INITIAL_EMAILS[0]);
  const [composing, setComposing] = useState(false);
  const [folder, setFolder] = useState('Inbox');
  const [replyTo, setReplyTo] = useState<Email | null>(null);
  const [search, setSearch] = useState('');
  const toRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const folderEmails = emails.filter(e => {
    if (e.folder !== folder) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.subject.toLowerCase().includes(q) || e.from.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q);
    }
    return true;
  });

  const select = (email: Email) => {
    setSelected(email);
    setEmails(e => e.map(m => m.id === email.id ? { ...m, read: true } : m));
    setComposing(false);
    setReplyTo(null);
  };

  const deleteEmail = (email: Email) => {
    if (email.folder === 'Deleted') {
      setEmails(e => e.filter(m => m.id !== email.id));
    } else {
      setEmails(e => e.map(m => m.id === email.id ? { ...m, folder: 'Deleted' } : m));
    }
    setSelected(null);
  };

  const replyEmail = (email: Email) => {
    setReplyTo(email);
    setComposing(true);
  };

  const sendEmail = () => {
    const subject = subjectRef.current?.value ?? '(No Subject)';
    const body = bodyRef.current?.value ?? '';
    const id = nextId++;
    setEmails(e => [...e, { id, from: 'Me', subject, preview: body.slice(0, 60) + '...', body, time: 'Just now', read: true, folder: 'Sent' }]);
    setComposing(false);
    setReplyTo(null);
  };

  return (
    <div className="outlook">
      <div className="outlook-sidebar">
        <button className="outlook-compose-btn" onClick={() => { setComposing(true); setReplyTo(null); }}>✉ New Email</button>
        <div style={{ padding: '6px 8px' }}>
          <input
            style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #555', background: '#3a3a3a', color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
            placeholder="Search mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {FOLDER_DEFS.map(f => {
          const unread = emails.filter(e => e.folder === f.name && !e.read).length;
          return (
            <button key={f.name} className={`outlook-folder ${folder === f.name ? 'active' : ''}`} onClick={() => { setFolder(f.name); setSelected(null); setSearch(''); }}>
              <span>{f.icon} {f.name}</span>
              {unread > 0 && <span className="outlook-badge">{unread}</span>}
            </button>
          );
        })}
      </div>

      <div className="outlook-list">
        {folderEmails.length === 0 && (
          <div style={{ padding: 20, color: '#888', textAlign: 'center', fontSize: 13 }}>
            {search ? `No results for "${search}"` : `No messages in ${folder}`}
          </div>
        )}
        {folderEmails.map(email => (
          <div key={email.id} className={`outlook-email-item ${selected?.id === email.id ? 'selected' : ''} ${!email.read ? 'unread' : ''}`} onClick={() => select(email)}>
            <div className="outlook-email-from">{email.from}</div>
            <div className="outlook-email-subject">{email.subject}</div>
            <div className="outlook-email-preview">{email.preview}</div>
            <div className="outlook-email-time">{email.time}</div>
          </div>
        ))}
      </div>

      <div className="outlook-content">
        {composing ? (
          <div className="outlook-compose">
            <div className="outlook-compose-header">{replyTo ? `Re: ${replyTo.subject}` : 'New Message'}</div>
            <div className="outlook-compose-field"><label>To:</label><input ref={toRef} className="outlook-compose-input" defaultValue={replyTo ? replyTo.from : ''} /></div>
            <div className="outlook-compose-field"><label>Subject:</label><input ref={subjectRef} className="outlook-compose-input" defaultValue={replyTo ? `Re: ${replyTo.subject}` : ''} /></div>
            <textarea ref={bodyRef} className="outlook-compose-body" placeholder="Write your message..." defaultValue={replyTo ? `\n\n--- Original message ---\nFrom: ${replyTo.from}\n\n${replyTo.body}` : ''} />
            <div className="outlook-compose-actions">
              <button className="outlook-send-btn" onClick={sendEmail}>📤 Send</button>
              <button className="outlook-discard-btn" onClick={() => { setComposing(false); setReplyTo(null); }}>Discard</button>
            </div>
          </div>
        ) : selected ? (
          <div className="outlook-reader">
            <div className="outlook-reader-subject">{selected.subject}</div>
            <div className="outlook-reader-meta">
              <span><b>From:</b> {selected.from}</span>
              <span className="outlook-reader-time">{selected.time}</span>
            </div>
            <div className="outlook-reader-body">{selected.body}</div>
            <div className="outlook-reader-actions">
              <button className="outlook-action-btn" onClick={() => replyEmail(selected)}>↩ Reply</button>
              <button className="outlook-action-btn" onClick={() => { setReplyTo({ ...selected, subject: `Fwd: ${selected.subject}` }); setComposing(true); }}>↪ Forward</button>
              <button className="outlook-action-btn" onClick={() => deleteEmail(selected)}>🗑 {selected.folder === 'Deleted' ? 'Delete Permanently' : 'Delete'}</button>
            </div>
          </div>
        ) : (
          <div className="outlook-empty">Select an email to read</div>
        )}
      </div>
    </div>
  );
}
