/**
 * SortMentor Frontend JavaScript
 * Handles UI interactions, API calls, and visualization
 */

let currentVisualizationData = null;
let currentStepIndex = 0;
let visualizationInterval = null;
let isPlaying = false;
let comparisons = 0;
let swaps = 0;

// Helper functions for Explainability Panel
function updateStats(type) {
    if (type === 'compare') {
        comparisons++;
        const el = document.getElementById('comparisonCount');
        if (el) el.textContent = comparisons;
    } else if (type === 'swap') {
        swaps++;
        const el = document.getElementById('swapCount');
        if (el) el.textContent = swaps;
    }
}

function updateStep(text) {
    const el = document.getElementById('stepText');
    if (el) el.innerHTML = text;
}

function updateStatus(text) {
    const el = document.getElementById('statusText');
    if (el) el.textContent = text;
}

// DOM Elements
const dataInput = document.getElementById('dataInput');
const selectedAlgorithm = document.getElementById('selectedAlgorithm');
const userLevel = document.getElementById('userLevel');
const analyzeBtn = document.getElementById('analyzeBtn');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const analysisSection = document.getElementById('analysisSection');

// Results elements
const recommendedAlg = document.getElementById('recommendedAlg');
const reasoning = document.getElementById('reasoning');
const learningTip = document.getElementById('learningTip');
const visualization = document.getElementById('visualization');
const comparisonTableBody = document.getElementById('comparisonTableBody');
const analysisContent = document.getElementById('analysisContent');
const tryOtherBtn = document.getElementById('tryOtherBtn');
const toggleWhyNotBtn = document.getElementById('toggleWhyNotBtn');
const whyNotSection = document.getElementById('whyNotSection');
const whyNotContent = document.getElementById('whyNotContent');
const whyNotIcon = document.getElementById('whyNotIcon');

const toggleComparisonBtn = document.getElementById('toggleComparisonBtn');
const comparisonSection = document.getElementById('comparisonSection');
const comparisonIcon = document.getElementById('comparisonIcon');

// File Upload
const fileInput = document.getElementById('fileInput');
const fileStatus = document.getElementById('fileStatus');

// Control buttons
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');
const currentStep = document.getElementById('currentStep');
const totalSteps = document.getElementById('totalSteps');

// Generate buttons (if they exist)
const generateRandomBtn = document.getElementById('generateRandomBtn');
const generateLargeBtn = document.getElementById('generateLargeBtn');
const generateSortedBtn = document.getElementById('generateSortedBtn');
const generateReversedBtn = document.getElementById('generateReversedBtn');
const generateIdenticalBtn = document.getElementById('generateIdenticalBtn');

// New Educational Features
const stepBackBtn = document.getElementById('stepBackBtn');
const stepForwardBtn = document.getElementById('stepForwardBtn');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const audioIconOn = document.getElementById('audioIconOn');
const audioIconOff = document.getElementById('audioIconOff');
const codeLanguage = document.getElementById('codeLanguage');
const codeBlock = document.getElementById('codeBlock');
const theoryTime = document.getElementById('theoryTime');
const maxComparisons = document.getElementById('maxComparisons');
const maxSwaps = document.getElementById('maxSwaps');

const CODE_LINE_MAP = {
    'bubble': { 'comparison': 6, 'swap': 7, 'lock_element': 3, 'all_sorted': 9 },
    'insertion': { 'comparison': 5, 'shift': 6, 'insertion_end': 8, 'insertion_start': 3 },
    'selection': { 'set_min': 4, 'comparison': 6, 'new_min': 7, 'swap_min': 8, 'swap': 8 },
    'merge': { 'merge': 10 }, 
    'heap': { 'heapify_start': 2, 'comparison': 5, 'swap': 8, 'extract_max': 15 },
    'quick': { 'pivot_selection': 3, 'comparison': 6, 'swap': 8, 'pivot_move': 9, 'pivot_final': 9 }
};

// Audio Context
let audioCtx = null;
let isAudioEnabled = false;

// Event Listeners
analyzeBtn.addEventListener('click', handleAnalyze);
runBtn.addEventListener('click', handleRunSession);
clearBtn.addEventListener('click', handleClear);
playBtn.addEventListener('click', handlePlay);
pauseBtn.addEventListener('click', handlePause);
resetBtn.addEventListener('click', handleReset);
if (speedSlider) {
    speedSlider.addEventListener('input', () => {
        if (isPlaying) {
            handlePause();
            handlePlay();
        }
    });
}
if (tryOtherBtn) tryOtherBtn.addEventListener('click', handleTryOther);
if (toggleWhyNotBtn) toggleWhyNotBtn.addEventListener('click', handleToggleWhyNot);
if (toggleComparisonBtn) toggleComparisonBtn.addEventListener('click', handleToggleComparison);

if (generateRandomBtn) {
    generateRandomBtn.addEventListener('click', handleGenerateRandom);
}
if (generateLargeBtn) {
    generateLargeBtn.addEventListener('click', handleGenerateLarge);
}
if (generateSortedBtn) {
    generateSortedBtn.addEventListener('click', handleGenerateSorted);
}
if (generateReversedBtn) {
    generateReversedBtn.addEventListener('click', handleGenerateReversed);
}
if (generateIdenticalBtn) {
    generateIdenticalBtn.addEventListener('click', handleGenerateIdentical);
}
if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
        isAudioEnabled = !isAudioEnabled;
        if (isAudioEnabled) {
            audioIconOn.classList.remove('hidden');
            audioIconOff.classList.add('hidden');
            // Init audio context on first user interaction
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } else {
            audioIconOn.classList.add('hidden');
            audioIconOff.classList.remove('hidden');
        }
    });
}
if (stepForwardBtn) {
    stepForwardBtn.addEventListener('click', () => {
        handlePause();
        handleStepForward();
    });
}
if (stepBackBtn) {
    stepBackBtn.addEventListener('click', () => {
        handlePause();
        handleStepBack();
    });
}

// File Upload Listener
if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
}

/**
 * Handle File Upload (TXT/CSV)
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (fileStatus) {
        fileStatus.textContent = 'Reading file...';
        fileStatus.classList.remove('hidden', 'text-red-500');
        fileStatus.classList.add('text-blue-500');
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        dataInput.value = text;
        if (fileStatus) {
            fileStatus.textContent = `File "${file.name}" loaded successfully.`;
            fileStatus.classList.remove('text-blue-500', 'text-red-500');
            fileStatus.classList.add('text-green-500');
        }
    };

    reader.onerror = function () {
        if (fileStatus) {
            fileStatus.textContent = 'Error reading file.';
            fileStatus.classList.remove('text-blue-500', 'text-green-500');
            fileStatus.classList.add('text-red-500');
        }
        showError('Failed to read the uploaded file.');
    };

    reader.readAsText(file);
}

/**
 * Parse input data (supports comma-separated or JSON array)
 */
function parseInputData(input) {
    if (!input || input.trim() === '') {
        throw new Error('Input cannot be empty');
    }

    const trimmedInput = input.trim();
    let data;

    // Try parsing as JSON first
    if (trimmedInput.startsWith('[')) {
        try {
            // Check if JSON appears complete (ends with ])
            if (!trimmedInput.endsWith(']')) {
                throw new Error('JSON array appears incomplete. Make sure it ends with ]');
            }

            // Try to parse
            data = JSON.parse(trimmedInput);

            // Validate it's actually an array
            if (!Array.isArray(data)) {
                throw new Error('JSON input must be an array');
            }
        } catch (e) {
            if (e.message.includes('incomplete') || e.message.includes('array')) {
                throw e;
            }
            // Check for common JSON errors
            if (e.message.includes('Unexpected end')) {
                throw new Error('JSON input is incomplete or truncated. Please check your input.');
            } else if (e.message.includes('Unexpected token')) {
                throw new Error('Invalid JSON format. Please check for syntax errors.');
            } else {
                throw new Error(`Invalid JSON format: ${e.message}`);
            }
        }
    } else {
        // Parse as comma-separated values
        try {
            data = trimmedInput.split(',').map(item => {
                const trimmed = item.trim();
                if (trimmed === '') {
                    return null; // Will filter out empty strings
                }
                const num = parseInt(trimmed, 10);
                if (isNaN(num)) {
                    throw new Error(`Invalid number: "${trimmed}"`);
                }
                return num;
            }).filter(item => item !== null); // Remove nulls from empty strings
        } catch (e) {
            throw e; // Re-throw parsing errors
        }
    }

    if (!Array.isArray(data)) {
        throw new Error('Data must be an array');
    }

    if (data.length === 0) {
        throw new Error('Array cannot be empty');
    }

    // Warn about very large arrays (but allow them)
    if (data.length > 5000) {
        console.warn(`Large array detected (${data.length} elements). Processing may take longer.`);
    }

    return data;
}

let pipelineInterval = null;

/**
 * Show loading indicator and animate the Agentic Pipeline
 */
function showLoading(isPipeline = true) {
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
    
    // Reset pipeline UI
    for(let i=1; i<=5; i++) {
        const stepEl = document.getElementById(`pipe-step-${i}`);
        if(!stepEl) continue;
        const icon = stepEl.querySelector('.pipe-icon');
        const card = stepEl.querySelector('.pipe-card');
        const desc = document.getElementById(`pipe-desc-${i}`);
        
        icon.className = 'w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 border-4 border-white shadow-sm z-10 transition-colors duration-500 pipe-icon';
        icon.innerHTML = i;
        card.className = 'flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-500 pipe-card opacity-50';
        
        if (i===1) desc.textContent = 'Scanning raw dataset...';
        else if(i===2) desc.textContent = 'Waiting for data...';
        else if(i===3) desc.textContent = 'Waiting for features...';
        else if(i===4) desc.textContent = 'Pending predictions...';
        else if(i===5) desc.textContent = 'Pending validation...';
    }
    
    if (pipelineInterval) clearInterval(pipelineInterval);
    
    if (isPipeline && document.getElementById('pipe-step-1')) {
        let currentStep = 1;
        document.getElementById('pipe-step-1').querySelector('.pipe-card').classList.remove('opacity-50');
        
        pipelineInterval = setInterval(() => {
            if (currentStep < 5) {
                completePipelineStep(currentStep);
                currentStep++;
                activatePipelineStep(currentStep);
            }
        }, 800);
    }
}

function completePipelineStep(step) {
    const stepEl = document.getElementById(`pipe-step-${step}`);
    if(!stepEl) return;
    const icon = stepEl.querySelector('.pipe-icon');
    const desc = document.getElementById(`pipe-desc-${step}`);
    icon.className = 'w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white border-4 border-white shadow-sm z-10 transition-colors duration-500 pipe-icon';
    icon.innerHTML = '✓';
    desc.textContent = 'Completed';
}

function activatePipelineStep(step) {
    const stepEl = document.getElementById(`pipe-step-${step}`);
    if(!stepEl) return;
    const card = stepEl.querySelector('.pipe-card');
    const desc = document.getElementById(`pipe-desc-${step}`);
    card.classList.remove('opacity-50');
    card.classList.add('border-indigo-300', 'bg-indigo-50');
    
    if(step===2) desc.textContent = 'Extracting N, sortedness, entropy...';
    else if(step===3) desc.textContent = 'Querying heuristics && ML model...';
    else if(step===4) desc.textContent = 'Validating stability and complexity...';
    else if(step===5) desc.textContent = 'Formulating XAI reasoning...';
}

async function finishPipeline() {
    if (pipelineInterval) {
        clearInterval(pipelineInterval);
        pipelineInterval = null;
    }
    for(let i=1; i<=5; i++) {
        completePipelineStep(i);
        const card = document.getElementById(`pipe-step-${i}`)?.querySelector('.pipe-card');
        if(card) {
            card.classList.remove('opacity-50', 'border-indigo-300', 'bg-indigo-50');
        }
    }
    // brief pause before hiding
    return new Promise(r => setTimeout(r, 600));
}

/**
 * Hide loading indicator
 */
async function hideLoading(instant = false) {
    if (!instant && document.getElementById('pipe-step-1')) {
        await finishPipeline();
    } else {
        if (pipelineInterval) clearInterval(pipelineInterval);
    }
    loadingIndicator.classList.add('hidden');
}

/**
 * Show error message with better formatting
 */
function showError(message) {
    hideLoading();
    // Create a more user-friendly error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="font-bold">Error</p>
                <p class="text-sm mt-1">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">×</button>
        </div>
    `;
    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);

    // Also log to console for debugging
    console.error('SortMentor Error:', message);
}

/**
 * Handle Analyze button click
 */
async function handleAnalyze() {
    try {
        const input = dataInput.value.trim();
        const data = parseInputData(input);

        showLoading(false);

        const response = await fetch('/api/sortmentor/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Analysis failed');
        }

        displayAnalysis(result.features);
        hideLoading(true);
        analysisSection.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Display data analysis results
 */
function displayAnalysis(features) {
    const metrics = [
        { label: 'Size (n)', value: features.n },
        { label: 'Sortedness', value: (features.sortedness * 100).toFixed(1) + '%' },
        { label: 'Duplicates', value: (features.duplicates_ratio * 100).toFixed(1) + '%' },
        { label: 'Range', value: features.data_range.toFixed(0) },
        { label: 'Min', value: features.min },
        { label: 'Max', value: features.max },
        { label: 'Unique Count', value: features.unique_count },
        { label: 'Nearly Sorted', value: features.is_nearly_sorted ? 'Yes' : 'No' }
    ];

    analysisContent.innerHTML = metrics.map(metric => `
        <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">${metric.label}</p>
            <p class="text-xl font-bold text-blue-600">${metric.value}</p>
        </div>
    `).join('') + `
        <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Entropy</p>
            <p class="text-xl font-bold text-blue-600">${features.entropy ? features.entropy.toFixed(2) : 'N/A'}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Std Deviation</p>
            <p class="text-xl font-bold text-blue-600">${features.std_dev ? features.std_dev.toFixed(2) : 'N/A'}</p>
        </div>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Presorted Segments</p>
            <p class="text-xl font-bold text-blue-600">${features.presorted_segments || 0}</p>
        </div>
    `;
}

/**
 * Handle Run Session button click - Run selected algorithm and compare with others
 */
async function handleRunSession() {
    try {
        const input = dataInput.value.trim();
        const data = parseInputData(input);
        const level = userLevel ? userLevel.value : 'intermediate';
        const selectedAlg = selectedAlgorithm.value;

        showLoading(true);

        // Single Unified Call to Backend Session
        const response = await fetch('/api/sortmentor/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data,
                algorithm: selectedAlg,
                userLevel: level
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Session failed');
        }

        // Parse the unified response format
        const formattedResult = {
            "Recommended Algorithm": result.recommendation.algorithm,
            "Executed Algorithm": result.selected_execution.algorithm,
            "Explanation": result.explanation, // Pass the whole object
            "Learning Tip": result.explanation.tip,
            "visualization_data": result.selected_execution,
            "all_results": result.comparison,
            "selected_algorithm": selectedAlg || result.recommendation.algorithm,
            "selected_rank": result.rank,
            "visualization_downsampled": result.visualization_downsampled
        };

        displayResults(formattedResult, selectedAlg);
        populateWhyNot(result.comparison, result.recommendation.algorithm, result.selected_execution.algorithm);
        
        await hideLoading(false);
        resultsSection.classList.remove('hidden');
    } catch (error) {
        hideLoading(true);
        showError(error.message);
    }
}

/**
 * Analyze data to get features
 */
async function analyzeDataForFeatures(data) {
    try {
        const response = await fetch('/api/sortmentor/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });
        const result = await response.json();
        return result.features || {};
    } catch (error) {
        return {};
    }
}

/**
 * (Removed formatPerformanceSummary as it is no longer used in the UI)
 */

/**
 * Format markdown text to HTML
 */
function formatMarkdown(text) {
    if (!text) return '';
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`([^`]*)`/g, '<code class="bg-gray-100 px-1 rounded text-indigo-700 font-mono text-sm">$1</code>');
    formatted = formatted.replace(/\$([^\$]*)\$/g, '<code class="bg-gray-100 px-1 rounded text-indigo-700 font-mono text-sm">$1</code>');
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

/**
 * Display SortMentor results
 */
function displayResults(result, userSelected) {
    // Format algorithm names
    const recommendedName = result['Recommended Algorithm'].charAt(0).toUpperCase() + result['Recommended Algorithm'].slice(1) + " Sort";
    const executedName = result['Executed Algorithm'].charAt(0).toUpperCase() + result['Executed Algorithm'].slice(1) + " Sort";

    // Display recommendation vs execution
    if (userSelected && userSelected !== result['Recommended Algorithm']) {
        recommendedAlg.innerHTML = `<span class="text-sm text-gray-500 block mb-1">Running: <b class="text-indigo-600">${executedName}</b></span><span class="text-xs text-gray-400">AI Recommends: ${recommendedName}</span>`;
    } else {
        recommendedAlg.textContent = recommendedName;
    }

    // Display reasoning (Structured AI Insights)
    const exp = result['Explanation'];
    if (exp && typeof exp === 'object' && exp.conceptual_overview) {
        reasoning.innerHTML = `
            <div class="space-y-4">
                <section>
                    <h4 class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Concept</h4>
                    <div class="text-gray-800 leading-relaxed">${formatMarkdown(exp.conceptual_overview)}</div>
                </section>
                <section class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Data Analysis</h4>
                    <div class="text-indigo-900 text-sm">${formatMarkdown(exp.data_analysis)}</div>
                </section>
                <section>
                    <h4 class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Performance Verdict</h4>
                    <div class="text-gray-800 leading-relaxed">${formatMarkdown(exp.performance_verdict)}</div>
                </section>
                <section class="border-t border-gray-100 pt-3">
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pro Tip</h4>
                    <div class="text-gray-600 italic text-sm">${formatMarkdown(exp.optimization_advice)}</div>
                </section>
            </div>
        `;
    } else if (typeof exp === 'string') {
        reasoning.innerHTML = formatMarkdown(exp);
    } else if (exp && exp.reasoning) {
        reasoning.innerHTML = formatMarkdown(exp.reasoning);
    }

    // Extract metrics for executed algorithm
    const execAlgName = result['Executed Algorithm'];
    const execSwaps = result.visualization_data?.swaps ?? 'N/A';
    const execComps = result.visualization_data?.comparisons ?? 'N/A';

    // Extract metrics for AI recommended algorithm
    const recAlgName = result['Recommended Algorithm'];
    let recSwaps = 'N/A';
    let recComps = 'N/A';
    
    if (result.all_results) {
        const recData = result.all_results.find(r => r.algorithm === recAlgName);
        if (recData) {
            recSwaps = recData.swaps ?? 'N/A';
            recComps = recData.comparisons ?? 'N/A';
        }
    }

    reasoning.innerHTML += `
        <div class="mt-4 border-t border-gray-100 pt-4">
            <h4 class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Execution Metrics Comparison</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- User Choice -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p class="text-[0.65rem] text-gray-500 uppercase font-bold mb-2">User Choice: <span class="text-indigo-600">${execAlgName}</span></p>
                    <div class="flex flex-col xl:flex-row gap-2 text-sm">
                        <div class="bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200 flex items-center gap-1.5 w-full whitespace-nowrap">
                            <span>🔄</span>
                            <span class="text-xs"><b>Swaps:</b> ${execSwaps}</span>
                        </div>
                        <div class="bg-purple-50 text-purple-800 px-2 py-1 rounded border border-purple-200 flex items-center gap-1.5 w-full whitespace-nowrap">
                            <span>⚖️</span>
                            <span class="text-xs"><b>Comps:</b> ${execComps}</span>
                        </div>
                    </div>
                </div>

                <!-- AI Recommendation -->
                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 shadow-[0_2px_10px_rgba(79,70,229,0.06)]">
                    <p class="text-[0.65rem] text-indigo-500 uppercase font-bold mb-2 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                        AI Recommended: <span class="text-indigo-700">${recAlgName}</span>
                    </p>
                    <div class="flex flex-col xl:flex-row gap-2 text-sm">
                        <div class="bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200 flex items-center gap-1.5 w-full whitespace-nowrap">
                            <span>🔄</span>
                            <span class="text-xs"><b>Swaps:</b> ${recSwaps}</span>
                        </div>
                        <div class="bg-purple-50 text-purple-800 px-2 py-1 rounded border border-purple-200 flex items-center gap-1.5 w-full whitespace-nowrap">
                            <span>⚖️</span>
                            <span class="text-xs"><b>Comps:</b> ${recComps}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Display learning tip
    learningTip.textContent = result['Learning Tip'];

    // Store visualization data
    if (result.visualization_data) {
        currentVisualizationData = result.visualization_data;
        currentVisualizationData.isDownsampled = result.visualization_downsampled;
        currentStepIndex = 0;
        const stepsLength = result.visualization_data.steps ? result.visualization_data.steps.length : 0;
        totalSteps.textContent = stepsLength;
        
        // Populate Advanced HUD
        if (theoryTime && result.visualization_data.theoretical_complexity) {
            theoryTime.innerHTML = `Worst: <b class="text-indigo-600">${result.visualization_data.theoretical_complexity.worst}</b>`;
        }
        if (maxComparisons && result.visualization_data.theoretical_max_comparisons) {
            maxComparisons.textContent = `/ max ≈ ${result.visualization_data.theoretical_max_comparisons}`;
        }
        if (maxSwaps && result.visualization_data.theoretical_max_swaps) {
            maxSwaps.textContent = `/ max ≈ ${result.visualization_data.theoretical_max_swaps}`;
        }
        
        // Populate Code String
        if (codeLanguage) codeLanguage.textContent = 'Python Implementation';
        if (codeBlock && result.visualization_data.code_snippet) {
            codeBlock.innerHTML = result.visualization_data.code_snippet.split('\n')
                .map((line, i) => `<div id="code-line-${i+1}" class="code-line px-2 py-0.5 whitespace-pre">${line || ' '}</div>`)
                .join('');
        }

        if (stepsLength > 0) {
            renderVisualization();
        } else {
            visualization.innerHTML = '<p class="text-gray-600">Visualization steps not available for this algorithm</p>';
        }
    }

    // Display comparison table
    if (result.all_results) {
        displayComparisonTable(result.all_results);
    }
}

/**
 * Display comparison table
 */
function displayComparisonTable(results) {
    if (!results || results.length === 0) {
        comparisonTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No comparison data available</td></tr>';
        return;
    }

    // Get selected algorithm from stored data
    const selectedAlg = currentVisualizationData?.algorithm || '';

    // Define Complexity Matrix
    // Define Complexity Matrix for fallback
    const complexities = {
        'bubble': { time: 'Ω(n) / Θ(n²) / O(n²)', space: 'O(1)', stable: 'Yes' },
        'insertion': { time: 'Ω(n) / Θ(n²) / O(n²)', space: 'O(1)', stable: 'Yes' },
        'selection': { time: 'Ω(n²) / Θ(n²) / O(n²)', space: 'O(1)', stable: 'No' },
        'merge': { time: 'Ω(n log n) / Θ(n log n) / O(n log n)', space: 'O(n)', stable: 'Yes' },
        'quick': { time: 'Ω(n log n) / Θ(n log n) / O(n²)', space: 'O(log n)', stable: 'No' },
        'heap': { time: 'Ω(n log n) / Θ(n log n) / O(n log n)', space: 'O(1)', stable: 'No' }
    };

    comparisonTableBody.innerHTML = results.map((result, index) => {
        const algKey = result.algorithm.toLowerCase();
        const isSelected = algKey === selectedAlg;
        
        // Use theoretical complexity from backend if available, fallback to frontend matrix
        const compFromBackend = result.theoretical_complexity;
        let c;
        if (compFromBackend) {
            c = {
                time: `${compFromBackend.best} / ${compFromBackend.time} / ${compFromBackend.time}`,
                space: compFromBackend.space,
                stable: result.is_stable ? 'Yes' : 'No'
            };
        } else {
            c = complexities[algKey] || { time: 'Unknown', space: 'Unknown', stable: 'Unknown' };
        }

        const rowClass = isSelected ? 'bg-indigo-50 relative' : 'hover:bg-gray-50 transition-colors';
        const rankBadge = index === 0 ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">Fastest</span>' : '';
        const selectedBadge = isSelected ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 ml-2">Selected</span>' : '';

        return `
        <tr class="${rowClass}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="font-bold text-gray-900">${result.algorithm.charAt(0).toUpperCase() + result.algorithm.slice(1)} Sort</span>
                    ${rankBadge}
                    ${selectedBadge}
                </div>
                ${isSelected ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono tracking-tighter">
                ${c.time.replace(/\//g, '<span class="text-gray-300 mx-1">/</span>')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                ${c.space}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.stable === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${c.stable}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-indigo-600">
                ${result.time_ms.toFixed(2)}
            </td>
        </tr>
    `;
    }).join('');
}

/**
 * Render visualization
 */
function renderVisualization() {
    if (!currentVisualizationData || !currentVisualizationData.steps) {
        visualization.innerHTML = '<p class="text-gray-600">No visualization data available</p>';
        return;
    }

    if (currentStepIndex >= currentVisualizationData.steps.length) {
        currentStepIndex = currentVisualizationData.steps.length - 1;
    }

    const step = currentVisualizationData.steps[currentStepIndex];
    const array = step.array || currentVisualizationData.initial_array;

    if (!array || array.length === 0) {
        visualization.innerHTML = '<p class="text-gray-600">No array data available</p>';
        return;
    }

    if (currentStepIndex === 0) {
        comparisons = 0;
        swaps = 0;
        const compEl = document.getElementById('comparisonCount');
        const swapEl = document.getElementById('swapCount');
        if (compEl) compEl.textContent = 0;
        if (swapEl) swapEl.textContent = 0;
        updateStatus("Started");
    }

    currentStep.textContent = currentStepIndex + 1;

    const maxVal = Math.max(...array);
    const minVal = Math.min(...array);
    const range = maxVal - minVal || 1;

    // Prefer backend-generated conceptual explanation, fall back to legacy message
    let explanationText = step.explanation || 'Processing this step of the algorithm.';
    if (step.message && step.explanation && step.message !== step.explanation) {
        explanationText = `<strong>${step.message}</strong> &mdash; ${explanationText}`;
    } else if (step.message) {
        explanationText = `<strong>${step.message}</strong>`;
    }

    // Determine event badge based on event_type (or infer from step characteristics)
    let eventType = step.event_type || '';
    if (!eventType) {
        if (step.swap) eventType = 'swap';
        else if (step.compare) eventType = 'compare';
        else if (step.pivot !== undefined) eventType = 'pivot';
    }

    let badgeClass = 'badge-state';
    let badgeIcon = 'ℹ️';
    let badgeText = 'State';

    if (eventType.includes('swap')) {
        badgeClass = 'badge-swap';
        badgeIcon = '🔄';
        badgeText = 'Swapping';
        updateStats('swap');
        const v1 = step.swap ? array[step.swap[0]] : 'X';
        const v2 = step.swap ? array[step.swap[1]] : 'Y';
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-indigo-500 font-bold">Action: Swapping <b>${v1}</b> and <b>${v2}</b></span><span class="text-sm font-medium text-gray-700">${explanationText}</span>`);
        updateStatus("Swapping");
    } else if (eventType.includes('compare') || eventType.includes('comparison')) {
        badgeClass = 'badge-comparison';
        badgeIcon = '⚖️';
        badgeText = 'Comparing';
        updateStats('compare');
        const v1 = step.compare ? array[step.compare[0]] : 'X';
        const v2 = step.compare ? array[step.compare[1]] : 'Y';
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-indigo-500 font-bold">Action: Comparing <b>${v1}</b> and <b>${v2}</b></span><span class="text-sm font-medium text-gray-700">${explanationText}</span>`);
        updateStatus("Comparing");
    } else if (eventType.includes('pivot')) {
        badgeClass = 'badge-pivot';
        badgeIcon = '🎯';
        badgeText = 'Pivot';
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-indigo-500 font-bold">Action: Selecting Pivot</span><span class="text-sm font-medium text-gray-700">${explanationText}</span>`);
        updateStatus("Processing");
    } else if (eventType.includes('merge')) {
        badgeClass = 'badge-merge';
        badgeIcon = '✨';
        badgeText = 'Merging';
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-indigo-500 font-bold">Action: Merging Elements</span><span class="text-sm font-medium text-gray-700">${explanationText}</span>`);
        updateStatus("Merging");
    } else if (eventType.includes('sorted')) {
        badgeClass = 'badge-state';
        badgeIcon = '✅';
        badgeText = 'Sorted';
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-green-600 font-bold">Action: Fully Sorted</span><span class="text-sm font-medium text-gray-700">The algorithm has finished executing successfully.</span>`);
        updateStatus("Completed");
    } else {
        updateStep(`<span class="block mb-1 text-xs uppercase tracking-wider text-indigo-500 font-bold">Action: Evaluating</span><span class="text-sm font-medium text-gray-700">${explanationText}</span>`);
        updateStatus(badgeText);
    }

    let downsampledNotice = '';
    if (currentVisualizationData.isDownsampled) {
        downsampledNotice = `
            <div class="bg-indigo-50 border border-indigo-200 p-3 rounded-lg flex items-start gap-3 mb-4 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 h-full w-2 bg-indigo-500"></div>
                <div class="text-indigo-600 flex-shrink-0 mt-0.5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-bold text-indigo-900 leading-tight mb-0.5">Large Dataset Detected</p>
                    <p class="text-xs text-indigo-700 leading-snug">
                        To maintain smooth browser performance, this visualization displays a representative <b>20-element sample</b> of your massive dataset. 
                        The Time Efficiency table below reflects the true performance for the full array size.
                    </p>
                </div>
            </div>
        `;
    }

    const badgeHtml = `<span class="event-badge ${badgeClass} text-xs px-2 py-0.5" style="display:inline-flex;align-items:center;background-color:#E0E7FF;color:#3730A3;border-radius:999px;font-weight:600;">${badgeIcon} ${badgeText}</span>`;
    const eventBadgeContainer = document.getElementById('eventBadgeContainer');
    if (eventBadgeContainer) {
        eventBadgeContainer.innerHTML = badgeHtml;
    }

    const isFinalStep = currentStepIndex === currentVisualizationData.steps.length - 1;

    visualization.innerHTML = downsampledNotice + `
        <div class="step-container">            
            <div class="flex flex-wrap items-end justify-center gap-2" style="min-height: 200px; padding: 10px;">
                ${array.map((value, index) => {
        let className = 'array-element';
        const height = ((value - minVal) / range) * 150 + 30; // Scale height

        let isActive = false;
        
        if (isFinalStep) {
            className += ' sorted';
            isActive = true;
        } else {
            if (step.compare && (step.compare[0] === index || step.compare[1] === index)) {
                className += ' comparing';
                isActive = true;
                if (index === step.compare[0]) playTone(value, maxVal);
            }
            if (step.swap && (step.swap[0] === index || step.swap[1] === index)) {
                className += ' swapping';
                isActive = true;
                if (index === step.swap[0]) playTone(value, maxVal);
            }
            if (step.pivot !== undefined && step.pivot === index) {
                className += ' pivot';
                isActive = true;
            }
            if (step.locked_indices && step.locked_indices.includes(index)) {
                className += ' sorted';
                isActive = true;
            }
        }

        // Focus Mode: Dim inactive elements
        const hasActiveElements = step.compare || step.swap || step.pivot !== undefined;
        if (hasActiveElements && !isActive && !isFinalStep) {
            className += ' dim';
        }

        return `<div id="elem-${index}" class="${className}" style="width: 44px !important; height: 44px !important; min-width: 44px !important; min-height: 44px !important; flex: 0 0 44px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.95rem;">
                    <span class="z-10">${value}</span>
                </div>`;
    }).join('')}
            </div>
        </div>
    `;
    
    // Trigger Line Highlighting
    highlightCodeLine(step, currentVisualizationData.algorithm);
}

/**
 * Handle Source Code Syntax Line Highlighting
 */
function highlightCodeLine(step, algorithm) {
    if (!CODE_LINE_MAP[algorithm]) return;
    
    document.querySelectorAll('.code-line').forEach(el => {
        el.classList.remove('bg-yellow-200', 'font-bold', 'border-l-4', 'border-yellow-500', 'pl-1');
    });
    
    let eventType = step.event_type || '';
    if (!eventType) {
        if (step.swap) eventType = 'swap';
        else if (step.compare) eventType = 'comparison';
        else if (step.pivot !== undefined) eventType = 'pivot_selection';
    }

    const lineNum = CODE_LINE_MAP[algorithm][eventType];
    if (!lineNum) return;
    
    const lineEl = document.getElementById(`code-line-${lineNum}`);
    if (lineEl) {
        lineEl.classList.add('bg-yellow-200', 'font-bold', 'border-l-4', 'border-yellow-500', 'pl-1');
        // Gently ensure the node is visible in the Pre Block
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Get dynamic animation delay from slider
 */
function getAnimationDelay() {
    if (!speedSlider) return 1000;
    const speed = parseInt(speedSlider.value);
    
    // Convert 1 (Slow) to 100 (Fast) into milliseconds (2000ms -> 20ms) using a quadratic curve
    const maxDelay = 2000;
    const minDelay = 20;
    const ratio = (100 - speed) / 99; // 0 (fast) to 1 (slow)
    return minDelay + (maxDelay - minDelay) * Math.pow(ratio, 2);
}

/**
 * Handle Play button
 */
function handlePlay() {
    if (!currentVisualizationData || !currentVisualizationData.steps) {
        return;
    }

    if (isPlaying) {
        return;
    }

    isPlaying = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;

    visualizationInterval = setInterval(() => {
        currentStepIndex++;
        if (currentStepIndex >= currentVisualizationData.steps.length) {
            handlePause();
            return;
        }
        renderVisualization();
    }, getAnimationDelay());
}

/**
 * Handle Pause button
 */
function handlePause() {
    isPlaying = false;
    playBtn.disabled = false;
    pauseBtn.disabled = true;

    if (visualizationInterval) {
        clearInterval(visualizationInterval);
        visualizationInterval = null;
    }
}

/**
 * Handle Reset button
 */
function handleReset() {
    handlePause();
    currentStepIndex = 0;
    renderVisualization();
}

/**
 * Handle Manual Step Forward
 */
function handleStepForward() {
    if (!currentVisualizationData || !currentVisualizationData.steps) return;
    if (currentStepIndex < currentVisualizationData.steps.length - 1) {
        currentStepIndex++;
        renderVisualization();
    }
}

/**
 * Handle Manual Step Backward
 */
function handleStepBack() {
    if (!currentVisualizationData || !currentVisualizationData.steps) return;
    if (currentStepIndex > 0) {
        currentStepIndex--;
        recalculateStats(currentStepIndex);
        renderVisualization();
    }
}

/**
 * Recalculate stats when stepping backwards to prevent cumulative overcounting
 */
function recalculateStats(targetIndex) {
    if (!currentVisualizationData) return;
    comparisons = 0;
    swaps = 0;
    const steps = currentVisualizationData.steps;
    for(let i=0; i<targetIndex; i++) {
        const s = steps[i];
        let eventType = s.event_type || '';
        if (!eventType) {
            if (s.swap) eventType = 'swap';
            else if (s.compare) eventType = 'compare';
            else if (s.pivot !== undefined) eventType = 'pivot';
        }
        if (eventType.includes('swap')) swaps++;
        else if (eventType.includes('compare') || eventType.includes('comparison')) comparisons++;
    }
    const compEl = document.getElementById('comparisonCount');
    const swapEl = document.getElementById('swapCount');
    if (compEl) compEl.textContent = comparisons;
    if (swapEl) swapEl.textContent = swaps;
}

/**
 * Handle Clear button
 */
function handleClear() {
    dataInput.value = '';
    resultsSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
    currentVisualizationData = null;
    currentStepIndex = 0;
    handlePause();
}

/**
 * Generate random array (20-100 elements)
 */
function handleGenerateRandom() {
    const size = Math.floor(Math.random() * 80) + 20; // 20-100 elements
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 1000) + 1);
    dataInput.value = JSON.stringify(arr);
}

/**
 * Generate large array (1000 elements) as JSON
 */
function handleGenerateLarge() {
    const size = 1000;
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 10000) + 1);
    dataInput.value = JSON.stringify(arr);
    showToast(`Generated ${size} massive random elements!`);
}

function handleGenerateSorted() {
    const size = 60;
    const arr = Array.from({ length: size }, (_, i) => (i + 1) * 10);
    dataInput.value = JSON.stringify(arr);
    showToast(`Generated ${size} sorted elements!`);
}

function handleGenerateReversed() {
    const size = 60;
    const arr = Array.from({ length: size }, (_, i) => (size - i) * 10);
    dataInput.value = JSON.stringify(arr);
    showToast(`Generated ${size} reversed elements!`);
}

function handleGenerateIdentical() {
    const size = 60;
    const val = Math.floor(Math.random() * 500) + 100;
    const arr = Array.from({ length: size }, () => val);
    dataInput.value = JSON.stringify(arr);
    showToast(`Generated ${size} identical elements!`);
}

function showToast(message) {
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 font-bold';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
}

/**
 * Web Audio API Sonification
 */
function playTone(value, maxVal) {
    if (!isAudioEnabled) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // Safety check
    if (!maxVal || maxVal <= 0) maxVal = 1000;
    
    // Frequency range: 200Hz to 800Hz
    const minFreq = 200;
    const maxFreq = 800;
    const freq = minFreq + (value / maxVal) * (maxFreq - minFreq);
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'triangle'; // Smoother tone
    oscillator.frequency.value = freq;
    
    // Envelope to avoid popping
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// Initialize
pauseBtn.disabled = true;

/**
 * Interactive Features Handlers
 */
function handleToggleWhyNot() {
    if(!whyNotSection) return;
    if (whyNotSection.classList.contains('hidden')) {
        whyNotSection.classList.remove('hidden');
        if(whyNotIcon) whyNotIcon.classList.add('rotate-180');
    } else {
        whyNotSection.classList.add('hidden');
        if(whyNotIcon) whyNotIcon.classList.remove('rotate-180');
    }
}

function handleToggleComparison() {
    if(!comparisonSection) return;
    if (comparisonSection.classList.contains('hidden')) {
        comparisonSection.classList.remove('hidden');
        if(comparisonIcon) comparisonIcon.classList.add('rotate-180');
    } else {
        comparisonSection.classList.add('hidden');
        if(comparisonIcon) comparisonIcon.classList.remove('rotate-180');
    }
}

function handleTryOther() {
    const algos = ['bubble', 'insertion', 'selection', 'merge', 'quick', 'heap'];
    const currentAlg = currentVisualizationData?.algorithm || recommendedAlg.textContent.toLowerCase().split(' ')[0] || 'bubble';
    const available = algos.filter(a => !currentAlg.toLowerCase().includes(a));
    const nextAlg = available[Math.floor(Math.random() * available.length)] || 'quick';
    
    if(selectedAlgorithm) selectedAlgorithm.value = nextAlg;
    
    // Auto collapse why not
    if(whyNotSection) whyNotSection.classList.add('hidden');
    if(whyNotIcon) whyNotIcon.classList.remove('rotate-180');
    
    // Scroll up and run
    document.querySelector('.max-w-7xl').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        handleRunSession();
    }, 400);
}

function populateWhyNot(allResults, recommended, executed) {
    if (!whyNotContent || !allResults) return;
    whyNotContent.innerHTML = '';
    
    const explanations = {
        'bubble': "Bubble Sort has O(n²) complexity and requires excessive adjacent swaps. For datasets with high entropy or large size, this causes significant performance degradation.",
        'insertion': "Insertion Sort performs poorly when data is highly unsorted or reversely sorted, as it requires shifting many elements, degrading to O(n²).",
        'selection': "Selection Sort does not adapt to existing order in the dataset; it forces O(n²) comparisons even if the array is already mostly sorted.",
        'merge': "Merge Sort requires O(n) auxiliary memory space for merging. If space overhead is a constraint, in-place algorithms like Quick or Heap sort outperform it.",
        'quick': "Quick Sort is unstable. While average O(n log n), recursive divide-and-conquer can degrade to O(n²) if pivot selection aligns poorly with the dataset's specific entropy distribution.",
        'heap': "Heap Sort has poor cache locality. Although mathematically O(n log n), jumping around the array makes it practically slower than Quick Sort or Merge Sort for typical memory architectures."
    };
    
    let html = '';
    allResults.forEach(res => {
        const name = res.algorithm;
        if (name.toLowerCase() === recommended.toLowerCase()) return;
        
        html += `
        <div class="border-l-4 border-indigo-300 pl-4 py-1 mb-4 bg-gray-50 p-3 rounded-r-lg">
            <h5 class="font-bold text-gray-800 capitalize">${name} Sort</h5>
            <p class="text-sm text-gray-600 mt-1">${explanations[name.toLowerCase()] || "Suboptimal performance characteristics for the current features."}</p>
        </div>`;
    });
    whyNotContent.innerHTML = html;
}

