# QuantumDerma Experiments Leaderboard

_Auto-generated on 2026-08-29T13:42:02._

Ranked by **Macro F1** (descending). Protected baseline: Macro F1 = 0.39448.

| Experiment | Seed | PCA | Sampler | Loss | Gamma | LS | LR | WD | Scheduler | QL | Q | Epochs | BestEp | Acc | MacroF1 | W-F1 | BalAcc | ROC-AUC | Sens | ECE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.00 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 27 | 0.6813 | 0.3070 | 0.6405 | 0.2784 | 0.8378 | 0.2784 | 0.0468 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.00 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 27 | 0.6813 | 0.3070 | 0.6405 | 0.2784 | 0.8378 | 0.2784 | 0.0468 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.00 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 27 | 0.6813 | 0.3070 | 0.6405 | 0.2784 | 0.8378 | 0.2784 | 0.0468 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.00 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 27 | 0.6813 | 0.3070 | 0.6405 | 0.2784 | 0.8378 | 0.2784 | 0.0468 |
| None | 42 | 16 | balanced | FocalLoss | 2.00 | 0.00 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 40 | 38 | 0.5010 | 0.3056 | 0.5650 | 0.4125 | 0.8029 | 0.4125 | 0.0484 |
| None | 42 | 16 | balanced | FocalLoss | 2.00 | 0.05 | 0.00030 | 0.01000 | cosine_restarts | 4 | 10 | 40 | 39 | 0.4950 | 0.2995 | 0.5601 | 0.4194 | 0.8087 | 0.4194 | 0.0237 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.10 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 100 | 22 | 0.6800 | 0.2933 | 0.6383 | 0.2659 | 0.8409 | 0.2659 | 0.0377 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.10 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 22 | 0.6800 | 0.2933 | 0.6383 | 0.2659 | 0.8409 | 0.2659 | 0.0377 |
| None | 42 | 16 | normal | FocalLoss | 2.00 | 0.05 | 0.00050 | 0.01000 | cosine_restarts | 4 | 10 | 30 | 29 | 0.6806 | 0.2917 | 0.6383 | 0.2657 | 0.8396 | 0.2657 | 0.0425 |
| None | 42 | 32 | balanced | FocalLoss | 1.50 | 0.05 | 0.00020 | 0.01000 | plateau | 4 | 10 | 60 | 58 | 0.0120 | 0.0089 | 0.0187 | 0.0201 | 0.2006 | 0.0201 | 0.1334 |

Key: LS = label_smoothing, WD = weight_decay, QL = quantum_layers, Q = qubits, BestEp = best_epoch, BalAcc = balanced_accuracy, Sens = sensitivity_macro, W-F1 = weighted_f1.
