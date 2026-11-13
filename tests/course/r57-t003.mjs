import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Suppress expected console errors from failing the test runner
    page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('Clock synchronization failed')) {
            console.error(`Unexpected Page Error: ${msg.text()}`);
        }
    });

    try {
        await page.goto('http://localhost:8080/02%20-%20JS%20and%20CSS%20Clock/index-START.html');

        const clock = page.locator('.clock');

        // Test 1: Trigger the error state by passing an invalid Date object
        await page.evaluate(() => {
            window.setDate(new Date('Invalid String'));
        });

        let hasErrorClass = await clock.evaluate(el => el.classList.contains('error'));
        assert.strictEqual(hasErrorClass, true, 'Clock should apply the .error class when an invalid date is processed');

        // Test 2: Ensure the clock recovers when valid input is restored
        await page.evaluate(() => {
            window.setDate(new Date());
        });

        hasErrorClass = await clock.evaluate(el => el.classList.contains('error'));
        assert.strictEqual(hasErrorClass, false, 'Clock should remove the .error class and recover upon valid input');

        console.log('Success: All R57-T003 empty/error display assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();