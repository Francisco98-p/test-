const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let statsCache = null;
let cacheTimestamp = null;
let fileWatcher = null;

// Cache invalidation time (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Function to calculate stats
function calculateStats(items) {
    if (!items || items.length === 0) {
        return {
            total: 0,
            averagePrice: 0,
            totalValue: 0,
            categories: {},
            lastUpdated: new Date().toISOString()
        };
    }

    const total = items.length;
    const totalValue = items.reduce((acc, item) => acc + (item.price || 0), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    
    const categories = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    return {
        total,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        categories,
        lastUpdated: new Date().toISOString()
    };
}

// Function to read and calculate stats
async function getStats() {
    return new Promise((resolve, reject) => {
        fs.readFile(DATA_PATH, 'utf8', (err, raw) => {
            if (err) {
                reject(new Error(`Failed to read data file: ${err.message}`));
                return;
            }

            try {
                const items = JSON.parse(raw);
                const stats = calculateStats(items);
                resolve(stats);
            } catch (parseErr) {
                reject(new Error(`Failed to parse JSON: ${parseErr.message}`));
            }
        });
    });
}

// Function to update cache
async function updateCache() {
    try {
        console.log('[Stats Cache] Updating cache...');
        statsCache = await getStats();
        cacheTimestamp = Date.now();
        console.log('[Stats Cache] Cache updated successfully');
    } catch (error) {
        console.error('[Stats Cache] Failed to update cache:', error.message);
    }
}

// Initialize file watcher
function initializeWatcher() {
    if (fileWatcher) {
        fileWatcher.close();
    }

    try {
        fileWatcher = fs.watch(DATA_PATH, { persistent: false }, (eventType) => {
            if (eventType === 'change') {
                console.log('[Stats Cache] File changed, invalidating cache...');
                clearTimeout(initializeWatcher.timeout);
                initializeWatcher.timeout = setTimeout(() => {
                    updateCache();
                }, 100);
            }
        });
        
        console.log('[Stats Cache] File watcher initialized');
    } catch (watchErr) {
        console.warn('[Stats Cache] File watcher failed to initialize:', watchErr.message);
    }
}

// Check if cache is valid
function isCacheValid() {
    if (!statsCache || !cacheTimestamp) {
        return false;
    }
    
    const age = Date.now() - cacheTimestamp;
    return age < CACHE_DURATION;
}

// Initialize cache and watcher on module load
updateCache().then(() => {
    initializeWatcher();
});

// GET /api/stats
router.get('/', async (req, res, next) => {
    try {
        const forceRefresh = req.query.refresh === 'true';
        
        if (forceRefresh || !isCacheValid()) {
            console.log('[Stats Cache] Cache invalid or refresh requested, updating...');
            await updateCache();
        }

        if (statsCache) {
            const response = {
                ...statsCache,
                cached: true,
                cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : 0
            };
            res.json(response);
        } else {
            console.log('[Stats Cache] Cache unavailable, calculating on-demand...');
            const stats = await getStats();
            res.json({
                ...stats,
                cached: false,
                cacheAge: 0
            });
        }
    } catch (err) {
        next(err);
    }
});

// NEW: Cleanup function to be used by tests
function cleanup() {
    if (fileWatcher) {
        fileWatcher.close();
        fileWatcher = null;
    }
}

// NEW: Export both the router and the cleanup function
module.exports = { router, cleanup };