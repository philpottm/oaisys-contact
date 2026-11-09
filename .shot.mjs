import { chromium } from 'playwright';
const [url, out, scheme='light', w='390'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: process.env.HOME+'/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'});
const p = await b.newPage({ viewport:{width:+w,height:844}, deviceScaleFactor:2, colorScheme: scheme });
await p.goto(url, {waitUntil:'networkidle'});
await p.waitForTimeout(1500);
await p.screenshot({path: out, fullPage:true});
await b.close();
