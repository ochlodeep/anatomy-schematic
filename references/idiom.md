# Idiom: concept → native form

Each entry gives the native form, the mapping sentence to write before any geometry, the scaffolding that holds it, and what moves. The forms are built from `kit/schema.mjs` (`references/schema.md`). Pick the closest entry and adapt it. When a concept isn't here, derive its form the same way: what is one element, what does it sit on, which axis is which index, what does height mean, and what moves when the algorithm runs.

Rules that hold for every entry:
- **True counts.** Draw every element. Choose small true sizes (6 tokens, 8 individuals, 12 keys) and say in the caption that the sizes are small.
- **One height scale per kind of value**, shared by every structure that holds that kind (V and O share one).
- **Shared indices share an axis and a pitch**, so a row can be followed from one structure into the next.
- **Negative values** go below a reference plane: cells stand on a raised tray and sink into a well cut in it, or the sign is a second tone. Never let a cell hang.

## Contents
1. Arrays and tensors
2. Linear algebra
3. Neural networks
4. Trees and heaps
5. Hashing
6. Sequences and queues
7. Graphs
8. State and protocols
9. Optimisation and probability
10. Search and evolution

## 1. Arrays and tensors

**Array.** A row of cells on a tray, an index ruler along its front edge.
*"Each cube is one slot; its height is the value; the tick under it is its index."*
Moves: a carriage on a track beside the row marks the index being read or written.

**Tensor (rank 3).** A block of cubes in layers, `cellGrid({ dims: [nx, ny, nz] })`, on a datum with rulers on two edges and a short post with a tick per layer at one corner.
*"Each cube is one element; x is the column, y the row, z the channel."*
Moves: a slice (one layer) lifts on pillars to show it, or one fibre lights up.

**Reshape or transpose.** Two blocks of the same element count side by side, joined by a track; elements travel as tokens from their old position to their new one.

## 2. Linear algebra

**Matrix multiplication C = AB.** A on the left with its rows along y, B behind with its columns along x, C in the middle where they meet. Rows of A and C share the y ruler, columns of B and C share the x ruler.
*"Cell (i, j) of C is row i of A dotted with column j of B; height is the value."*
Moves: the row of A and the column of B for the hovered cell light, and the cell rises from zero to its value.

**Dot product.** Two equal rows facing each other across a track; a third row of products between them, and one column at the end for the sum.

**Eigenvectors.** A height field of the quadratic form `xᵀAx` with its two principal axes as tracks across it.

## 3. Neural networks

**Scaled dot-product attention.** `examples/attention/`. A 6 × 6 score grid with query i along y and key j along x; Q to its left (rows i), Kᵀ behind (columns j), V in front under the same key columns, O to the right on the same rows as the scores, each row reaching O along its own conduit.
*"Each cube is one number; the score grid's heights are the softmax weights, each row sums to 1."*
Moves: a carriage on a track picks the query; its Q row, score row, conduit and O row light.

**Dense layer.** Input row, weight grid, output row in the matmul layout, plus a bias row on a plinth and an activation shown as the output cells clipped at zero (ReLU: negative cells sit flat in their sockets).

**Convolution.** An input grid on a datum, a small kernel block on a carriage that rides tracks over it, and the output grid beside it. The kernel's footprint on the input lights; the output cell it produces rises.
*"The kernel is k × k cubes; each output cell is the sum of the products under its footprint."*

**Multi-layer network.** Layers as rows of node pucks on stepped plates (`plateStack` with pillars), each layer fully joined to the next by conduits. Keep it to 3–6 nodes a layer so every edge is drawn.

**Embedding lookup.** A tall table of rows on a rack, a token id on the index ruler, and the chosen row sliding out along a track to the right.

## 4. Trees and heaps

**Binary search tree.** Node pucks on stepped terraces, one terrace per depth, higher at the root, joined by conduits that drop from a parent's rim to a child's rim.
*"Each puck is a key; each terrace is a depth; left children sit to the left of their parent."*
Moves: a token travels the conduits from the root on a search or an insert, and the new node rises out of its socket.

**Heap.** The same tree, plus the array beneath it on a tray, with each array cell under its tree node's column. A sift-up swaps two pucks along their conduit and the two array cells at once.

**B-tree.** Nodes as trays holding several key cells, with port blocks between the keys where child conduits land.

## 5. Hashing

**Hash table with chaining.** A row of bucket trays on an index ruler. A key enters as a token at a hash port, travels a track to its bucket, and stacks on the keys already there.
*"Each tray is a bucket; each stacked token is a key in its chain; stack height is the chain length."*
Moves: inserting a colliding key makes a stack two high; a resize lays a second, longer row of trays and moves every token across.

**Open addressing.** The same row with one cell per slot; a probing token visits slots in order along the track and lights each one it finds full.

**Bloom filter.** A long row of bit cells (flat or raised), k hash ports, and k tokens per insert landing on their bits.

## 6. Sequences and queues

**Queue.** A track with cells on carriages; enqueue adds a carriage at the back, dequeue slides the front one off past the end stop.

**Stack.** A `plateStack` of equal plates on pillars; push lowers a plate onto the top, pop lifts it away.

**Ring buffer.** Cells around a circular tray with head and tail carriages on a ring track.

**Message queue with consumers.** A track of message cells feeding several consumer pucks through ports; an acknowledged message sinks into its socket.

## 7. Graphs

**Graph.** Node pucks on a datum, edges as conduits that land on the node collars (`node`, `edge`).
*"Each puck is a vertex; each conduit is an edge; weight is the conduit's lift or a cell beside it."*

**BFS / DFS.** The frontier as tokens resting on the nodes it holds; visited nodes light; a counter column beside the datum shows the queue or stack size.

**Shortest path.** Distances as columns standing beside each node; relaxing an edge lowers a column; the settled path's conduits light.

**Minimum spanning tree.** All edges drawn; chosen edges light in the order the algorithm picks them.

## 8. State and protocols

**State machine.** States as stations (pucks with a port per transition) on a ring track; the current state is a carriage that travels the track to its next station.

**Consensus (Raft, Paxos).** Nodes as pucks around a ring on the datum, each with a log as a short row of cells on its own tray. Messages are tokens running along the conduits between nodes; a committed entry lights in every log.
*"Each puck is a server; each cell in its tray is a log entry; a token on a conduit is a message in flight."*

**TCP handshake or a request flow.** Two (or more) endpoint pucks on long trays, a pair of conduits between them, and tokens for SYN, SYN-ACK and ACK; a sequence-number column on each endpoint.

## 9. Optimisation and probability

**Loss surface and gradient descent.** A `heightField` of the loss over two parameters, seated on its skirts on a datum, with a ball resting on the surface and the steps it took as small tokens on the facets.
*"x and y are the two weights; height is the loss; each token is one step of the optimiser."*
Moves: the ball rolls step by step; the learning rate is a carriage on a track.

**Distribution / histogram.** `columns` on a ruler, one column per bin; sampling drops a token into its bin and the column rises by one.

**Monte Carlo estimate.** A grid of cells as the sample space, samples as tokens landing on it, and a counter column for the running estimate.

**Markov chain.** States as pucks, transition probabilities as conduit lift, and the stationary distribution as columns beside each state.

## 10. Search and evolution

**Binary search.** The sorted array on its tray; two end-stop carriages (low and high) on a track beside it close in, and the middle cell lights at each step.

**Sorting.** The array on a tray; compared cells light, swapped cells slide past each other along a lowered track so they never pass through each other.

**Genetic algorithm.** `examples/ga-population/`. A population grid, rows as individuals and column height as gene value, beside a target row on a plinth. Culled rows sink, children rise in their slots with mutated genes lit, and loss stands as a pin at each row's end.

**Simulated annealing.** A height field with a ball and a temperature column; at high temperature the ball's steps include uphill tokens.
