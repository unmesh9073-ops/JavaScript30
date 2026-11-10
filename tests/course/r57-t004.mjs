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
        await page.goto('http://localhost:8080/10%20-%20Hold%20Shift%20and%20Check%20Checkboxes/index-START.html');

        // Test 1: Verify the UI initializes correctly the first time
        const isInitialized = await page.locator('.inbox').getAttribute('data-initialized');
        assert.strictEqual(isInitialized, 'true', 'Inbox should have data-initialized set to true on first load');

        // Test 2: Spy on addEventListener and attempt a second initialization
        const duplicateListeners = await page.evaluate(() => {
            let listenerAddCount = 0;
            const originalAdd = EventTarget.prototype.addEventListener;

            // Override to count new 'click' listeners
            EventTarget.prototype.addEventListener = function (...args) {
                if (args[0] === 'click') listenerAddCount++;
                originalAdd.apply(this, args);
            };

            // Attempt repeat initialization
            window.initCheckboxes();

            // Restore original function
            EventTarget.prototype.addEventListener = originalAdd;

            return listenerAddCount;
        });

        assert.strictEqual(duplicateListeners, 0, 'No duplicate event listeners should be added on repeat initialization');

        console.log('Success: All R57-T004 repeat initialization assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();