import React, { useState, useEffect, useRef } from 'react';
import styles from './SortingVisualizer.module.css';

const DEFAULT_ARRAY_SIZE = 50;
const MIN_VALUE = 10;
const MAX_VALUE = 500;
const ANIMATION_SPEED_MS = 10;

const ALGORITHM_INFO = {
    Bubble: {
        time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
        space: "O(1)"
    },
    Quick: {
        time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
        space: "O(log n)"
    },
    Merge: {
        time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
        space: "O(n)"
    }
};

export default function SortingVisualizer() {
    const [array, setArray] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [speed, setSpeed] = useState(50); // 1-100
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null); // 'Bubble', 'Quick', 'Merge'
    const containerRef = useRef(null);

    useEffect(() => {
        resetArray();
    }, []);

    const resetArray = () => {
        if (isSorting) return;
        const newArray = [];
        for (let i = 0; i < DEFAULT_ARRAY_SIZE; i++) {
            newArray.push(randomIntFromInterval(MIN_VALUE, MAX_VALUE));
        }
        setArray(newArray);
        // Reset colors
        const bars = document.getElementsByClassName(styles.arrayBar);
        for (let i = 0; i < bars.length; i++) {
            bars[i].className = styles.arrayBar;
        }
    };

    const getDelay = () => {
        // Speed 100 -> 1ms, Speed 1 -> 200ms
        return Math.max(1, 200 - (speed * 2));
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // --- Algorithms ---

    const bubbleSort = async () => {
        setIsSorting(true);
        setSelectedAlgorithm('Bubble');
        const arr = [...array];
        const bars = document.getElementsByClassName(styles.arrayBar);

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                // Visualize Comparison
                bars[j].classList.add(styles.comparing);
                bars[j + 1].classList.add(styles.comparing);

                await sleep(getDelay());

                if (arr[j] > arr[j + 1]) {
                    // Swap data
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    setArray([...arr]); // Visual update of height

                    // Visualize Swap
                    bars[j].classList.add(styles.swapping);
                    bars[j + 1].classList.add(styles.swapping);
                }

                await sleep(getDelay());

                // Revert colors
                bars[j].classList.remove(styles.comparing, styles.swapping);
                bars[j + 1].classList.remove(styles.comparing, styles.swapping);
            }
            // Mark as sorted
            bars[arr.length - i - 1].classList.add(styles.sorted);
        }
        // Mark first one as sorted too
        if (bars[0]) bars[0].classList.add(styles.sorted);
        setIsSorting(false);
    };

    const quickSort = async () => {
        setIsSorting(true);
        setSelectedAlgorithm('Quick');
        let arr = [...array];
        await quickSortHelper(arr, 0, arr.length - 1);
        setIsSorting(false);
    };

    const quickSortHelper = async (arr, low, high) => {
        if (low < high) {
            let pi = await partition(arr, low, high);
            await quickSortHelper(arr, low, pi - 1);
            await quickSortHelper(arr, pi + 1, high);
        } else if (low >= 0 && high >= 0 && low === high) {
            // Single element sorted
            const bars = document.getElementsByClassName(styles.arrayBar);
            bars[low].classList.add(styles.sorted);
        }
    };

    const partition = async (arr, low, high) => {
        const bars = document.getElementsByClassName(styles.arrayBar);
        let pivot = arr[high];

        // Highlight pivot
        bars[high].classList.add(styles.swapping); // Use swapping color for pivot to distinguish

        let i = (low - 1);

        for (let j = low; j <= high - 1; j++) {
            // Comparison
            bars[j].classList.add(styles.comparing);
            await sleep(getDelay());

            if (arr[j] < pivot) {
                i++;
                // Swap
                let temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                setArray([...arr]);
            }
            bars[j].classList.remove(styles.comparing);
        }
        // Swap pivot to correct place
        let temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        setArray([...arr]);

        // Mark pivot's new position as sorted (roughly) or just reset color
        bars[high].classList.remove(styles.swapping);
        bars[i + 1].classList.add(styles.sorted);

        await sleep(getDelay());

        return (i + 1);
    };

    const mergeSort = async () => {
        setIsSorting(true);
        setSelectedAlgorithm('Merge');
        let arr = [...array];
        await mergeSortHelper(arr, 0, arr.length - 1);

        // Mark all as sorted at end
        const bars = document.getElementsByClassName(styles.arrayBar);
        for (let i = 0; i < bars.length; i++) bars[i].classList.add(styles.sorted);

        setIsSorting(false);
    };

    const mergeSortHelper = async (arr, l, r) => {
        if (l >= r) return;
        const m = l + Math.floor((r - l) / 2);
        await mergeSortHelper(arr, l, m);
        await mergeSortHelper(arr, m + 1, r);
        await merge(arr, l, m, r);
    };

    const merge = async (arr, l, m, r) => {
        const n1 = m - l + 1;
        const n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        let i = 0, j = 0, k = l;
        const bars = document.getElementsByClassName(styles.arrayBar);

        while (i < n1 && j < n2) {
            // Highlight
            bars[l + i].classList.add(styles.comparing);
            bars[m + 1 + j].classList.add(styles.comparing);
            await sleep(getDelay());

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            // Update visualization for position k
            setArray([...arr]);

            bars[l + i > m ? m : l + i].classList.remove(styles.comparing); // Cleanup approximate
            bars[m + 1 + j > r ? r : m + 1 + j].classList.remove(styles.comparing);

            k++;
        }

        while (i < n1) {
            arr[k] = L[i];
            setArray([...arr]);
            await sleep(getDelay());
            i++;
            k++;
        }

        while (j < n2) {
            arr[k] = R[j];
            setArray([...arr]);
            await sleep(getDelay());
            j++;
            k++;
        }
    };


    return (
        <div className={styles.visualizerContainer}>
            <div className={styles.arrayContainer} ref={containerRef}>
                {array.map((value, idx) => (
                    <div
                        className={styles.arrayBar}
                        key={idx}
                        style={{
                            height: `${value}px`,
                            // We rely on CSS classes for changing colors, but dynamic height is inline
                        }}
                    ></div>
                ))}
            </div>

            <div className={styles.controls}>
                <button className={styles.button} onClick={resetArray} disabled={isSorting}>
                    Generate New Array
                </button>

                <div className={styles.sliderContainer}>
                    <label>Speed</label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                        className={styles.slider}
                        disabled={isSorting}
                    />
                </div>

                <button className={styles.button} onClick={bubbleSort} disabled={isSorting}>
                    Bubble Sort
                </button>
                <button className={styles.button} onClick={quickSort} disabled={isSorting}>
                    Quick Sort
                </button>
                <button className={styles.button} onClick={mergeSort} disabled={isSorting}>
                    Merge Sort
                </button>
            </div>


            {
                selectedAlgorithm && (
                    <div className={styles.infoContainer}>
                        <div className={styles.infoTitle}>{selectedAlgorithm} Sort</div>
                        <div className={styles.infoText}>
                            <span className={styles.infoLabel}>Time (Best):</span> {ALGORITHM_INFO[selectedAlgorithm].time.best}
                        </div>
                        <div className={styles.infoText}>
                            <span className={styles.infoLabel}>Time (Avg):</span> {ALGORITHM_INFO[selectedAlgorithm].time.avg}
                        </div>
                        <div className={styles.infoText}>
                            <span className={styles.infoLabel}>Time (Worst):</span> {ALGORITHM_INFO[selectedAlgorithm].time.worst}
                        </div>
                        <div className={styles.infoText}>
                            <span className={styles.infoLabel}>Space:</span> {ALGORITHM_INFO[selectedAlgorithm].space}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
