import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8080/07%20-%20Array%20Cardio%20Day%202/index-START.html');

        // Helper function to check horizontal overflow
        const checkOverflow = async () => {
            return await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
        };

        // Test 1: Desktop Width (1280x800)
        await page.setViewportSize({ width: 1280, height: 800 });
        const isDesktopOverflowing = await checkOverflow();
        assert.strictEqual(isDesktopOverflowing, false, 'Layout should not overflow horizontally at 1280x800');

        // Test 2: Mobile Width (360x800)
        await page.setViewportSize({ width: 360, height: 800 });
        const isMobileOverflowing = await checkOverflow();
        assert.strictEqual(isMobileOverflowing, false, 'Layout should not overflow horizontally at 360x800');

        // Test 3: Computed Layout Check
        const bodyPadding = await page.evaluate(() => window.getComputedStyle(document.body).padding);
        assert.strictEqual(bodyPadding, '16px', 'Body padding should drop to 1rem (16px) on mobile viewports');

        console.log('Success: All R57-T002 layout and overflow assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();