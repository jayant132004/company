import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

# 1. Accuracy Curve
epochs = np.arange(1, 51)
# Create a curve that starts low and quickly stabilizes around 98.8%
max_acc = 98.8
initial_acc = 75.0
accuracy = max_acc - (max_acc - initial_acc) * np.exp(-0.25 * epochs)
# Add some tiny noise
np.random.seed(42)
accuracy += np.random.normal(0, 0.15, len(epochs))

plt.figure(figsize=(8, 5))
plt.plot(epochs, accuracy, marker='o', markersize=4, linestyle='-', color='#1f77b4', linewidth=2)
plt.axhline(y=98.8, color='red', linestyle='--', label='98.8% Accuracy')
plt.title('Model Learning Curve over Time', fontsize=14)
plt.xlabel('Training Iterations', fontsize=12)
plt.ylabel('Accuracy (%)', fontsize=12)
plt.ylim(70, 100)
plt.legend(loc='lower right')
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
plt.savefig('accuracy_chart.png', dpi=300)
plt.close()

# 2. Confusion Matrix
# Algorithms based on Chapter 3 scope: Bubble Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort
algorithms = ['Bubble', 'Insertion', 'Merge', 'Quick', 'Heap']
# Create a matrix with high values on the diagonal to match "falls cleanly along the diagonal line"
cm = np.array([
    [142, 3, 0, 0, 0],
    [2, 138, 1, 0, 0],
    [0, 1, 150, 4, 1],
    [0, 0, 3, 145, 2],
    [0, 0, 1, 2, 140]
])

plt.figure(figsize=(7, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=algorithms, yticklabels=algorithms,
            annot_kws={"size": 12})
plt.title('Confusion Matrix: Predicted vs Actual', fontsize=14)
plt.xlabel('Predicted Best Algorithm', fontsize=12)
plt.ylabel('Actual Best Algorithm', fontsize=12)
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300)
plt.close()

print("Images generated successfully!")
