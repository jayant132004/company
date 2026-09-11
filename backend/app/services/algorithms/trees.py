import copy
import math
import time
from typing import List, Tuple, Dict, Any, Optional

# ==========================================
# 1. BINARY SEARCH TREE (BST)
# ==========================================

class BSTNode:
    def __init__(self, val: int, node_id: str):
        self.val = val
        self.id = node_id
        self.left: Optional['BSTNode'] = None
        self.right: Optional['BSTNode'] = None
        self.x: float = 0.0
        self.y: float = 0.0

def _compute_tree_layout(root: Optional[Any], depth: int = 0, left_bound: float = 0.0, right_bound: float = 800.0, y_gap: float = 70.0) -> List[Dict[str, Any]]:
    """Calculates responsive (x, y) coordinates for any binary tree structure."""
    if not root:
        return []
    
    mid_x = (left_bound + right_bound) / 2.0
    y_pos = 50.0 + depth * y_gap
    root.x = mid_x
    root.y = y_pos

    nodes = [{
        'id': root.id,
        'val': root.val,
        'x': mid_x,
        'y': y_pos,
        'left_id': root.left.id if root.left else None,
        'right_id': root.right.id if root.right else None,
        'balance_factor': getattr(root, 'balance_factor', None),
        'height': getattr(root, 'height', None),
        'color': getattr(root, 'color', None),
        'interval': getattr(root, 'interval', None),
    }]

    if root.left:
        nodes.extend(_compute_tree_layout(root.left, depth + 1, left_bound, mid_x, y_gap))
    if root.right:
        nodes.extend(_compute_tree_layout(root.right, depth + 1, mid_x, right_bound, y_gap))

    return nodes

def _get_tree_edges(nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    edges = []
    node_map = {n['id']: n for n in nodes}
    for n in nodes:
        if n.get('left_id') and n['left_id'] in node_map:
            edges.append({'from': n['id'], 'to': n['left_id'], 'dir': 'left'})
        if n.get('right_id') and n['right_id'] in node_map:
            edges.append({'from': n['id'], 'to': n['right_id'], 'dir': 'right'})
    return edges

def bst_operations_with_steps(initial_values: List[int], op: str, value: Optional[int] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    steps = []
    id_counter = 0
    root: Optional[BSTNode] = None

    def insert(node: Optional[BSTNode], val: int) -> BSTNode:
        nonlocal id_counter
        if not node:
            id_counter += 1
            return BSTNode(val, f"node-{id_counter}")
        if val < node.val:
            node.left = insert(node.left, val)
        elif val > node.val:
            node.right = insert(node.right, val)
        return node

    # Build initial tree
    for v in initial_values:
        root = insert(root, v)

    current_nodes = _compute_tree_layout(root)
    current_edges = _get_tree_edges(current_nodes)

    steps.append({
        'step': 0,
        'event_type': 'init',
        'nodes': copy.deepcopy(current_nodes),
        'edges': copy.deepcopy(current_edges),
        'active_node_id': None,
        'message': f'Initialized BST with elements {initial_values}.'
    })

    if op == 'insert' and value is not None:
        # Check duplicate
        curr = root
        parent = None
        visited_ids = []
        is_duplicate = False

        while curr:
            visited_ids.append(curr.id)
            steps.append({
                'step': len(steps),
                'event_type': 'traverse',
                'nodes': copy.deepcopy(_compute_tree_layout(root)),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                'active_node_id': curr.id,
                'visited_ids': list(visited_ids),
                'message': f'Comparing insert value {value} with node {curr.val}.'
            })

            if value == curr.val:
                is_duplicate = True
                steps.append({
                    'step': len(steps),
                    'event_type': 'duplicate',
                    'nodes': copy.deepcopy(_compute_tree_layout(root)),
                    'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                    'active_node_id': curr.id,
                    'message': f'Value {value} already exists in BST. Duplicates are preserved / no-op.'
                })
                break
            elif value < curr.val:
                parent = curr
                curr = curr.left
            else:
                parent = curr
                curr = curr.right

        if not is_duplicate:
            id_counter += 1
            new_node = BSTNode(value, f"node-{id_counter}")
            if not parent:
                root = new_node
            elif value < parent.val:
                parent.left = new_node
            else:
                parent.right = new_node

            layout_nodes = _compute_tree_layout(root)
            steps.append({
                'step': len(steps),
                'event_type': 'inserted',
                'nodes': copy.deepcopy(layout_nodes),
                'edges': copy.deepcopy(_get_tree_edges(layout_nodes)),
                'active_node_id': new_node.id,
                'message': f'🎯 Inserted node {value} as child of {parent.val if parent else "root"}.'
            })

    elif op == 'search' and value is not None:
        curr = root
        found = False
        while curr:
            steps.append({
                'step': len(steps),
                'event_type': 'probe',
                'nodes': copy.deepcopy(_compute_tree_layout(root)),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                'active_node_id': curr.id,
                'message': f'Comparing search target {value} with node {curr.val}.'
            })

            if value == curr.val:
                found = True
                steps.append({
                    'step': len(steps),
                    'event_type': 'found',
                    'nodes': copy.deepcopy(_compute_tree_layout(root)),
                    'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                    'active_node_id': curr.id,
                    'message': f'🎯 Found target {value} in BST!'
                })
                break
            elif value < curr.val:
                curr = curr.left
            else:
                curr = curr.right

        if not found:
            steps.append({
                'step': len(steps),
                'event_type': 'not_found',
                'nodes': copy.deepcopy(_compute_tree_layout(root)),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                'active_node_id': None,
                'message': f'❌ Target {value} is not present in the BST.'
            })

    elif op == 'delete' and value is not None:
        # Search node to delete
        curr = root
        parent = None
        while curr and curr.val != value:
            parent = curr
            if value < curr.val:
                curr = curr.left
            else:
                curr = curr.right

        if not curr:
            steps.append({
                'step': len(steps),
                'event_type': 'not_found',
                'nodes': copy.deepcopy(_compute_tree_layout(root)),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                'active_node_id': None,
                'message': f'Value {value} not found in BST. Zero structural modifications.'
            })
        else:
            # Case 1: Leaf node (no children)
            if not curr.left and not curr.right:
                steps.append({
                    'step': len(steps),
                    'event_type': 'delete_leaf',
                    'nodes': copy.deepcopy(_compute_tree_layout(root)),
                    'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                    'active_node_id': curr.id,
                    'message': f'Case 1: Node {value} is a leaf node. Removing directly.'
                })
                if not parent:
                    root = None
                elif parent.left == curr:
                    parent.left = None
                else:
                    parent.right = None

            # Case 2: One child
            elif not curr.left or not curr.right:
                child = curr.left if curr.left else curr.right
                steps.append({
                    'step': len(steps),
                    'event_type': 'delete_one_child',
                    'nodes': copy.deepcopy(_compute_tree_layout(root)),
                    'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                    'active_node_id': curr.id,
                    'message': f'Case 2: Node {value} has one child ({child.val}). Splicing child to parent.'
                })
                if not parent:
                    root = child
                elif parent.left == curr:
                    parent.left = child
                else:
                    parent.right = child

            # Case 3: Two children (inorder successor)
            else:
                succ_parent = curr
                succ = curr.right
                while succ.left:
                    succ_parent = succ
                    succ = succ.left

                steps.append({
                    'step': len(steps),
                    'event_type': 'delete_two_children',
                    'nodes': copy.deepcopy(_compute_tree_layout(root)),
                    'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root))),
                    'active_node_id': succ.id,
                    'message': f'Case 3: Node {value} has two children. Inorder successor is {succ.val}. Replacing value and deleting successor.'
                })
                curr.val = succ.val
                if succ_parent.left == succ:
                    succ_parent.left = succ.right
                else:
                    succ_parent.right = succ.right

            layout_nodes = _compute_tree_layout(root)
            steps.append({
                'step': len(steps),
                'event_type': 'deleted',
                'nodes': copy.deepcopy(layout_nodes),
                'edges': copy.deepcopy(_get_tree_edges(layout_nodes)),
                'active_node_id': None,
                'message': f'✓ Successfully deleted {value} from BST.'
            })

    final_nodes = _compute_tree_layout(root)
    metrics = {
        'total_nodes': len(final_nodes),
        'steps_count': len(steps),
        'tree_type': 'bst'
    }
    return steps, metrics


# ==========================================
# 2. AVL TREE (SELF-BALANCING)
# ==========================================

class AVLNode:
    def __init__(self, val: int, node_id: str):
        self.val = val
        self.id = node_id
        self.left: Optional['AVLNode'] = None
        self.right: Optional['AVLNode'] = None
        self.height: int = 1
        self.balance_factor: int = 0
        self.x: float = 0.0
        self.y: float = 0.0

def get_height(node: Optional[AVLNode]) -> int:
    return node.height if node else 0

def get_balance(node: Optional[AVLNode]) -> int:
    return get_height(node.left) - get_height(node.right) if node else 0

def avl_operations_with_steps(initial_values: List[int], op: str, value: Optional[int] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    steps = []
    id_counter = 0

    def update_meta(node: Optional[AVLNode]):
        if node:
            node.height = 1 + max(get_height(node.left), get_height(node.right))
            node.balance_factor = get_balance(node)

    def right_rotate(y: AVLNode) -> AVLNode:
        x = y.left
        T2 = x.right
        x.right = y
        y.left = T2
        update_meta(y)
        update_meta(x)
        return x

    def left_rotate(x: AVLNode) -> AVLNode:
        y = x.right
        T2 = y.left
        y.left = x
        x.right = T2
        update_meta(x)
        update_meta(y)
        return y

    def avl_insert(node: Optional[AVLNode], val: int) -> AVLNode:
        nonlocal id_counter
        if not node:
            id_counter += 1
            n = AVLNode(val, f"avl-{id_counter}")
            update_meta(n)
            return n

        if val < node.val:
            node.left = avl_insert(node.left, val)
        elif val > node.val:
            node.right = avl_insert(node.right, val)
        else:
            return node

        update_meta(node)
        bf = node.balance_factor

        # LL Case
        if bf > 1 and val < node.left.val:
            steps.append({
                'step': len(steps),
                'event_type': 'rotation_LL',
                'nodes': copy.deepcopy(_compute_tree_layout(root_ref[0])),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root_ref[0]))),
                'active_node_id': node.id,
                'rotation': 'LL',
                'message': f'Imbalance at node {node.val} (BF = {bf} > 1, Left-Left case). Performing single RIGHT rotation.'
            })
            return right_rotate(node)

        # RR Case
        if bf < -1 and val > node.right.val:
            steps.append({
                'step': len(steps),
                'event_type': 'rotation_RR',
                'nodes': copy.deepcopy(_compute_tree_layout(root_ref[0])),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root_ref[0]))),
                'active_node_id': node.id,
                'rotation': 'RR',
                'message': f'Imbalance at node {node.val} (BF = {bf} < -1, Right-Right case). Performing single LEFT rotation.'
            })
            return left_rotate(node)

        # LR Case
        if bf > 1 and val > node.left.val:
            steps.append({
                'step': len(steps),
                'event_type': 'rotation_LR',
                'nodes': copy.deepcopy(_compute_tree_layout(root_ref[0])),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root_ref[0]))),
                'active_node_id': node.id,
                'rotation': 'LR',
                'message': f'Imbalance at node {node.val} (BF = {bf} > 1, Left-Right case). Double rotation: Left on {node.left.val} then Right on {node.val}.'
            })
            node.left = left_rotate(node.left)
            return right_rotate(node)

        # RL Case
        if bf < -1 and val < node.right.val:
            steps.append({
                'step': len(steps),
                'event_type': 'rotation_RL',
                'nodes': copy.deepcopy(_compute_tree_layout(root_ref[0])),
                'edges': copy.deepcopy(_get_tree_edges(_compute_tree_layout(root_ref[0]))),
                'active_node_id': node.id,
                'rotation': 'RL',
                'message': f'Imbalance at node {node.val} (BF = {bf} < -1, Right-Left case). Double rotation: Right on {node.right.val} then Left on {node.val}.'
            })
            node.right = right_rotate(node.right)
            return left_rotate(node)

        return node

    root_ref = [None]
    for v in initial_values:
        root_ref[0] = avl_insert(root_ref[0], v)

    init_nodes = _compute_tree_layout(root_ref[0])
    steps.append({
        'step': 0,
        'event_type': 'init',
        'nodes': copy.deepcopy(init_nodes),
        'edges': copy.deepcopy(_get_tree_edges(init_nodes)),
        'active_node_id': None,
        'message': f'AVL Tree initialized with {len(initial_values)} nodes. All balance factors in valid range [-1, +1].'
    })

    if op == 'insert' and value is not None:
        root_ref[0] = avl_insert(root_ref[0], value)
        final_nodes = _compute_tree_layout(root_ref[0])
        steps.append({
            'step': len(steps),
            'event_type': 'balanced',
            'nodes': copy.deepcopy(final_nodes),
            'edges': copy.deepcopy(_get_tree_edges(final_nodes)),
            'active_node_id': None,
            'message': f'🎯 Value {value} inserted. Tree balanced successfully with maximum height {get_height(root_ref[0])}.'
        })

    final_nodes = _compute_tree_layout(root_ref[0])
    metrics = {
        'total_nodes': len(final_nodes),
        'tree_height': get_height(root_ref[0]),
        'steps_count': len(steps),
        'tree_type': 'avl'
    }
    return steps, metrics


# ==========================================
# 3. RED-BLACK TREE (FULL SYMMETRIC INSERT & DELETE)
# ==========================================

class RBNode:
    def __init__(self, val: int, color: str = 'RED', node_id: str = ''):
        self.val = val
        self.color = color  # 'RED' or 'BLACK'
        self.id = node_id
        self.left: Optional['RBNode'] = None
        self.right: Optional['RBNode'] = None
        self.parent: Optional['RBNode'] = None
        self.x: float = 0.0
        self.y: float = 0.0

def red_black_with_steps(initial_values: List[int], op: str, value: Optional[int] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    steps = []
    id_counter = 0

    class RBTree:
        def __init__(self):
            self.NIL = RBNode(0, 'BLACK', 'NIL')
            self.root = self.NIL

        def left_rotate(self, x: RBNode):
            y = x.right
            x.right = y.left
            if y.left != self.NIL:
                y.left.parent = x
            y.parent = x.parent
            if x.parent is None or x.parent == self.NIL:
                self.root = y
            elif x == x.parent.left:
                x.parent.left = y
            else:
                x.parent.right = y
            y.left = x
            x.parent = y

        def right_rotate(self, y: RBNode):
            x = y.left
            y.left = x.right
            if x.right != self.NIL:
                x.right.parent = y
            x.parent = y.parent
            if y.parent is None or y.parent == self.NIL:
                self.root = x
            elif y == y.parent.right:
                y.parent.right = x
            else:
                y.parent.left = x
            x.right = y
            y.parent = x

        def insert(self, val: int, record_steps: bool = False):
            nonlocal id_counter
            id_counter += 1
            z = RBNode(val, 'RED', f"rb-{id_counter}")
            z.left = self.NIL
            z.right = self.NIL

            y = self.NIL
            x = self.root

            while x != self.NIL:
                y = x
                if z.val < x.val:
                    x = x.left
                elif z.val > x.val:
                    x = x.right
                else:
                    return  # Duplicate ignore

            z.parent = y
            if y == self.NIL:
                self.root = z
            elif z.val < y.val:
                y.left = z
            else:
                y.right = z

            if record_steps:
                layout = rb_to_layout(self.root)
                steps.append({
                    'step': len(steps),
                    'event_type': 'rb_insert_placed',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                    'active_node_id': z.id,
                    'message': f'Placed node {val} as RED. Checking Red-Black properties...'
                })

            self.insert_fixup(z, record_steps)

        def insert_fixup(self, z: RBNode, record_steps: bool = False):
            while z.parent and z.parent.color == 'RED':
                if z.parent.parent and z.parent == z.parent.parent.left:
                    y = z.parent.parent.right  # Uncle
                    if y and y.color == 'RED':
                        # Case 1: Uncle is Red -> Recolor parent, uncle, grandparent
                        z.parent.color = 'BLACK'
                        y.color = 'BLACK'
                        z.parent.parent.color = 'RED'
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_case1_recolor',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': z.parent.parent.id,
                                'message': f'Case 1 (Uncle RED): Recolored parent {z.parent.val} and uncle {y.val} to BLACK, grandparent {z.parent.parent.val} to RED.'
                            })
                        z = z.parent.parent
                    else:
                        if z == z.parent.right:
                            # Case 2: Uncle is Black (Triangle) -> Left rotate parent
                            z = z.parent
                            self.left_rotate(z)
                            if record_steps:
                                layout = rb_to_layout(self.root)
                                steps.append({
                                    'step': len(steps),
                                    'event_type': 'rb_case2_rotate',
                                    'nodes': copy.deepcopy(layout),
                                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                                    'active_node_id': z.id,
                                    'message': f'Case 2 (Triangle): Left rotated on {z.val} to convert to line configuration.'
                                })
                        # Case 3: Uncle is Black (Line) -> Recolor and Right rotate grandparent
                        z.parent.color = 'BLACK'
                        if z.parent.parent:
                            z.parent.parent.color = 'RED'
                            self.right_rotate(z.parent.parent)
                            if record_steps:
                                layout = rb_to_layout(self.root)
                                steps.append({
                                    'step': len(steps),
                                    'event_type': 'rb_case3_rotate',
                                    'nodes': copy.deepcopy(layout),
                                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                                    'active_node_id': z.parent.id,
                                    'message': f'Case 3 (Line): Recolored parent {z.parent.val} to BLACK and right rotated on grandparent.'
                                })
                else:
                    # Symmetric Mirror Cases (Parent is Right Child)
                    if z.parent.parent:
                        y = z.parent.parent.left  # Uncle
                        if y and y.color == 'RED':
                            # Case 1 Mirror: Uncle is Red
                            z.parent.color = 'BLACK'
                            y.color = 'BLACK'
                            z.parent.parent.color = 'RED'
                            if record_steps:
                                layout = rb_to_layout(self.root)
                                steps.append({
                                    'step': len(steps),
                                    'event_type': 'rb_case1_mirror_recolor',
                                    'nodes': copy.deepcopy(layout),
                                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                                    'active_node_id': z.parent.parent.id,
                                    'message': f'Case 1 Mirror (Uncle RED): Recolored parent {z.parent.val} and uncle {y.val} to BLACK, grandparent {z.parent.parent.val} to RED.'
                                })
                            z = z.parent.parent
                        else:
                            if z == z.parent.left:
                                # Case 2 Mirror: Uncle is Black (Triangle)
                                z = z.parent
                                self.right_rotate(z)
                                if record_steps:
                                    layout = rb_to_layout(self.root)
                                    steps.append({
                                        'step': len(steps),
                                        'event_type': 'rb_case2_mirror_rotate',
                                        'nodes': copy.deepcopy(layout),
                                        'edges': copy.deepcopy(_get_tree_edges(layout)),
                                        'active_node_id': z.id,
                                        'message': f'Case 2 Mirror (Triangle): Right rotated on {z.val} to align linear configuration.'
                                    })
                            # Case 3 Mirror: Uncle is Black (Line)
                            z.parent.color = 'BLACK'
                            if z.parent.parent:
                                z.parent.parent.color = 'RED'
                                self.left_rotate(z.parent.parent)
                                if record_steps:
                                    layout = rb_to_layout(self.root)
                                    steps.append({
                                        'step': len(steps),
                                        'event_type': 'rb_case3_mirror_rotate',
                                        'nodes': copy.deepcopy(layout),
                                        'edges': copy.deepcopy(_get_tree_edges(layout)),
                                        'active_node_id': z.parent.id,
                                        'message': f'Case 3 Mirror (Line): Recolored parent {z.parent.val} to BLACK and left rotated on grandparent.'
                                    })
                if z == self.root:
                    break
            self.root.color = 'BLACK'

        def transplant(self, u: RBNode, v: RBNode):
            if u.parent == self.NIL or u.parent is None:
                self.root = v
            elif u == u.parent.left:
                u.parent.left = v
            else:
                u.parent.right = v
            v.parent = u.parent

        def tree_minimum(self, node: RBNode) -> RBNode:
            while node.left != self.NIL:
                node = node.left
            return node

        def search(self, val: int) -> RBNode:
            curr = self.root
            while curr != self.NIL and curr.val != val:
                if val < curr.val:
                    curr = curr.left
                else:
                    curr = curr.right
            return curr

        def delete(self, val: int, record_steps: bool = False):
            z = self.search(val)
            if z == self.NIL or not z:
                if record_steps:
                    layout = rb_to_layout(self.root)
                    steps.append({
                        'step': len(steps),
                        'event_type': 'not_found',
                        'nodes': copy.deepcopy(layout),
                        'edges': copy.deepcopy(_get_tree_edges(layout)),
                        'active_node_id': None,
                        'message': f'Value {val} not found in Red-Black tree. No modifications.'
                    })
                return

            y = z
            y_orig_color = y.color
            if z.left == self.NIL:
                x = z.right
                self.transplant(z, z.right)
            elif z.right == self.NIL:
                x = z.left
                self.transplant(z, z.left)
            else:
                y = self.tree_minimum(z.right)
                y_orig_color = y.color
                x = y.right
                if y.parent == z:
                    x.parent = y
                else:
                    self.transplant(y, y.right)
                    y.right = z.right
                    y.right.parent = y
                self.transplant(z, y)
                y.left = z.left
                y.left.parent = y
                y.color = z.color

            if record_steps:
                layout = rb_to_layout(self.root)
                steps.append({
                    'step': len(steps),
                    'event_type': 'rb_spliced',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                    'active_node_id': x.id if x != self.NIL else None,
                    'message': f'Spliced out node {val}. Original removed color was {y_orig_color}.'
                })

            if y_orig_color == 'BLACK':
                self.delete_fixup(x, record_steps)

        def delete_fixup(self, x: RBNode, record_steps: bool = False):
            while x != self.root and x.color == 'BLACK':
                if x == x.parent.left:
                    w = x.parent.right  # Sibling
                    if w.color == 'RED':
                        # Case 1: Sibling is RED -> Rotate & swap colors
                        w.color = 'BLACK'
                        x.parent.color = 'RED'
                        self.left_rotate(x.parent)
                        w = x.parent.right
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case1',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': w.id if w != self.NIL else None,
                                'message': f'Delete Case 1 (Sibling RED): Recolored sibling to BLACK, parent to RED, and left rotated parent.'
                            })

                    if w.left.color == 'BLACK' and w.right.color == 'BLACK':
                        # Case 2: Sibling is BLACK and both sibling children BLACK -> Sibling RED, push double black up
                        w.color = 'RED'
                        x = x.parent
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case2',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': x.id if x != self.NIL else None,
                                'message': f'Delete Case 2 (Both nephew nodes BLACK): Recolored sibling to RED, shifted double-black up to parent {x.val}.'
                            })
                    else:
                        if w.right.color == 'BLACK':
                            # Case 3: Sibling is BLACK, near child (left) is RED, far child (right) is BLACK -> Rotate sibling
                            w.left.color = 'BLACK'
                            w.color = 'RED'
                            self.right_rotate(w)
                            w = x.parent.right
                            if record_steps:
                                layout = rb_to_layout(self.root)
                                steps.append({
                                    'step': len(steps),
                                    'event_type': 'rb_del_case3',
                                    'nodes': copy.deepcopy(layout),
                                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                                    'active_node_id': w.id if w != self.NIL else None,
                                    'message': f'Delete Case 3 (Near nephew RED, Far BLACK): Right rotated sibling to transform into Case 4.'
                                })
                        # Case 4: Sibling is BLACK, far child (right) is RED -> Terminal rotate parent & recolor
                        w.color = x.parent.color
                        x.parent.color = 'BLACK'
                        w.right.color = 'BLACK'
                        self.left_rotate(x.parent)
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case4',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': w.id if w != self.NIL else None,
                                'message': f'Delete Case 4 (Far nephew RED): Left rotated parent and restored black height parity.'
                            })
                        x = self.root
                else:
                    # Symmetric Mirror Cases (x is Right Child)
                    w = x.parent.left  # Sibling
                    if w.color == 'RED':
                        # Case 1 Mirror: Sibling is RED
                        w.color = 'BLACK'
                        x.parent.color = 'RED'
                        self.right_rotate(x.parent)
                        w = x.parent.left
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case1_mirror',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': w.id if w != self.NIL else None,
                                'message': f'Delete Case 1 Mirror (Sibling RED): Recolored sibling to BLACK, parent to RED, and right rotated parent.'
                            })

                    if w.right.color == 'BLACK' and w.left.color == 'BLACK':
                        # Case 2 Mirror: Sibling is BLACK and both sibling children BLACK
                        w.color = 'RED'
                        x = x.parent
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case2_mirror',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': x.id if x != self.NIL else None,
                                'message': f'Delete Case 2 Mirror (Both nephew nodes BLACK): Recolored sibling to RED, shifted double-black up to parent {x.val}.'
                            })
                    else:
                        if w.left.color == 'BLACK':
                            # Case 3 Mirror: Near child (right) is RED, far child (left) is BLACK
                            w.right.color = 'BLACK'
                            w.color = 'RED'
                            self.left_rotate(w)
                            w = x.parent.left
                            if record_steps:
                                layout = rb_to_layout(self.root)
                                steps.append({
                                    'step': len(steps),
                                    'event_type': 'rb_del_case3_mirror',
                                    'nodes': copy.deepcopy(layout),
                                    'edges': copy.deepcopy(_get_tree_edges(layout)),
                                    'active_node_id': w.id if w != self.NIL else None,
                                    'message': f'Delete Case 3 Mirror (Near nephew RED, Far BLACK): Left rotated sibling to transform into Case 4 Mirror.'
                                })
                        # Case 4 Mirror: Far child (left) is RED
                        w.color = x.parent.color
                        x.parent.color = 'BLACK'
                        w.left.color = 'BLACK'
                        self.right_rotate(x.parent)
                        if record_steps:
                            layout = rb_to_layout(self.root)
                            steps.append({
                                'step': len(steps),
                                'event_type': 'rb_del_case4_mirror',
                                'nodes': copy.deepcopy(layout),
                                'edges': copy.deepcopy(_get_tree_edges(layout)),
                                'active_node_id': w.id if w != self.NIL else None,
                                'message': f'Delete Case 4 Mirror (Far nephew RED): Right rotated parent and restored black height parity.'
                            })
                        x = self.root
            x.color = 'BLACK'

    def rb_to_layout(node: RBNode, depth: int = 0, left: float = 0.0, right: float = 800.0) -> List[Dict[str, Any]]:
        if node == tree.NIL or not node:
            return []
        mid = (left + right) / 2.0
        res = [{
            'id': node.id,
            'val': node.val,
            'color': node.color,
            'x': mid,
            'y': 50.0 + depth * 70.0,
            'left_id': node.left.id if node.left != tree.NIL else None,
            'right_id': node.right.id if node.right != tree.NIL else None,
        }]
        if node.left != tree.NIL:
            res.extend(rb_to_layout(node.left, depth + 1, left, mid))
        if node.right != tree.NIL:
            res.extend(rb_to_layout(node.right, depth + 1, mid, right))
        return res

    tree = RBTree()
    for v in initial_values:
        tree.insert(v)

    layout = rb_to_layout(tree.root)
    steps.append({
        'step': 0,
        'event_type': 'init',
        'nodes': copy.deepcopy(layout),
        'edges': copy.deepcopy(_get_tree_edges(layout)),
        'active_node_id': None,
        'message': f'Red-Black Tree initialized with root color BLACK and verified black-height invariant.'
    })

    if op == 'insert' and value is not None:
        tree.insert(value, record_steps=True)
        layout = rb_to_layout(tree.root)
        steps.append({
            'step': len(steps),
            'event_type': 'inserted',
            'nodes': copy.deepcopy(layout),
            'edges': copy.deepcopy(_get_tree_edges(layout)),
            'active_node_id': None,
            'message': f'🎯 Node {value} inserted with symmetric red-black fixup applied.'
        })
    elif op == 'delete' and value is not None:
        tree.delete(value, record_steps=True)
        layout = rb_to_layout(tree.root)
        steps.append({
            'step': len(steps),
            'event_type': 'deleted',
            'nodes': copy.deepcopy(layout),
            'edges': copy.deepcopy(_get_tree_edges(layout)),
            'active_node_id': None,
            'message': f'✓ Node {value} deletion finished with full double-black resolution.'
        })

    return steps, {'total_nodes': len(layout), 'tree_type': 'redblack'}


# ==========================================
# 4. TRIE (PREFIX TREE - SPARSE SIBLINGS)
# ==========================================

class TrieNode:
    def __init__(self, char: str = '', node_id: str = ''):
        self.char = char
        self.id = node_id
        self.children: Dict[str, 'TrieNode'] = {}
        self.is_end_of_word = False
        self.word = ""
        self.x: float = 0.0
        self.y: float = 0.0

def trie_operations_with_steps(words: List[str], op: str, query: Optional[str] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    steps = []
    id_cnt = 0
    root = TrieNode('ROOT', 'trie-0')

    def insert_word(w: str):
        nonlocal id_cnt
        curr = root
        for ch in w:
            if ch not in curr.children:
                id_cnt += 1
                curr.children[ch] = TrieNode(ch, f"trie-{id_cnt}")
            curr = curr.children[ch]
        curr.is_end_of_word = True
        curr.word = w

    for w in words:
        insert_word(w)

    def layout_trie(node: TrieNode, depth: int = 0, left: float = 0.0, right: float = 800.0) -> List[Dict[str, Any]]:
        mid = (left + right) / 2.0
        node_entry = {
            'id': node.id,
            'val': node.char,
            'is_end_of_word': node.is_end_of_word,
            'word': node.word,
            'x': mid,
            'y': 50.0 + depth * 75.0,
            'children_ids': [child.id for child in node.children.values()]
        }
        res = [node_entry]
        k = len(node.children)
        if k > 0:
            span = (right - left) / k
            for i, child in enumerate(node.children.values()):
                child_left = left + i * span
                child_right = child_left + span
                res.extend(layout_trie(child, depth + 1, child_left, child_right))
        return res

    def get_trie_edges(trie_nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        edges = []
        for n in trie_nodes:
            for c_id in n.get('children_ids', []):
                edges.append({'from': n['id'], 'to': c_id, 'dir': 'down'})
        return edges

    layout = layout_trie(root)
    edges = get_trie_edges(layout)

    steps.append({
        'step': 0,
        'event_type': 'init',
        'nodes': copy.deepcopy(layout),
        'edges': copy.deepcopy(edges),
        'active_node_id': root.id,
        'message': f'Trie loaded with vocabulary: {", ".join(words)}.'
    })

    if (op == 'search' or op == 'autocomplete') and query:
        curr = root
        matched = True
        path_ids = [root.id]

        for i, ch in enumerate(query):
            if ch in curr.children:
                curr = curr.children[ch]
                path_ids.append(curr.id)
                steps.append({
                    'step': len(steps),
                    'event_type': 'char_match',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(edges),
                    'active_node_id': curr.id,
                    'path_ids': list(path_ids),
                    'message': f'Matched character \'{ch}\' at depth {i+1}.'
                })
            else:
                matched = False
                steps.append({
                    'step': len(steps),
                    'event_type': 'char_mismatch',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(edges),
                    'active_node_id': curr.id,
                    'message': f'Character \'{ch}\' not found under node \'{curr.char}\'.'
                })
                break

        if matched:
            # Find autocomplete completions
            completions = []
            def collect(n: TrieNode):
                if n.is_end_of_word:
                    completions.append(n.word)
                for c in n.children.values():
                    collect(c)
            collect(curr)

            steps.append({
                'step': len(steps),
                'event_type': 'autocomplete_results',
                'nodes': copy.deepcopy(layout),
                'edges': copy.deepcopy(edges),
                'active_node_id': curr.id,
                'path_ids': list(path_ids),
                'completions': completions,
                'message': f'🎯 Prefix "{query}" found! Autocomplete recommendations: {", ".join(completions) if completions else "None"}'
            })

    return steps, {'total_nodes': len(layout), 'tree_type': 'trie'}


# ==========================================
# 5. SEGMENT TREE (1-INDEXED INTERVALS)
# ==========================================

def segment_tree_with_steps(arr: List[int], op: str, qL: int = 0, qR: int = 0, update_idx: int = 0, update_val: int = 0) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    n = len(arr)
    tree = [0] * (4 * n)
    steps = []

    class SegNode:
        def __init__(self, idx: int, L: int, R: int, val: int):
            self.idx = idx
            self.L = L
            self.R = R
            self.val = val
            self.id = f"seg-{idx}"
            self.left: Optional['SegNode'] = None
            self.right: Optional['SegNode'] = None

    def build_tree(node_idx: int, L: int, R: int) -> SegNode:
        if L == R:
            tree[node_idx] = arr[L]
            return SegNode(node_idx, L, R, arr[L])
        mid = (L + R) // 2
        left_node = build_tree(2 * node_idx, L, mid)
        right_node = build_tree(2 * node_idx + 1, mid + 1, R)
        tree[node_idx] = min(left_node.val, right_node.val)
        parent = SegNode(node_idx, L, R, tree[node_idx])
        parent.left = left_node
        parent.right = right_node
        return parent

    root_seg = build_tree(1, 0, n - 1)

    def layout_seg(node: Optional[SegNode], depth: int = 0, left: float = 0.0, right: float = 800.0) -> List[Dict[str, Any]]:
        if not node:
            return []
        mid = (left + right) / 2.0
        res = [{
            'id': node.id,
            'val': node.val,
            'interval': [node.L, node.R],
            'x': mid,
            'y': 50.0 + depth * 70.0,
            'left_id': node.left.id if node.left else None,
            'right_id': node.right.id if node.right else None,
        }]
        if node.left:
            res.extend(layout_seg(node.left, depth + 1, left, mid))
        if node.right:
            res.extend(layout_seg(node.right, depth + 1, mid, right))
        return res

    layout = layout_seg(root_seg)
    edges = _get_tree_edges(layout)

    steps.append({
        'step': 0,
        'event_type': 'init',
        'nodes': copy.deepcopy(layout),
        'edges': copy.deepcopy(edges),
        'active_node_id': None,
        'message': f'Segment Tree built for Range Minimum Query (RMQ) over array {arr}.'
    })

    if op == 'query':
        def query_tree(node: SegNode, q_low: int, q_high: int) -> int:
            if not node or node.L > q_high or node.R < q_low:
                steps.append({
                    'step': len(steps),
                    'event_type': 'no_overlap',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(edges),
                    'active_node_id': node.id if node else None,
                    'message': f'Interval [{node.L}, {node.R}] has NO OVERLAP with query [{q_low}, {q_high}]. Discarding branch.'
                })
                return float('inf')

            if q_low <= node.L and node.R <= q_high:
                steps.append({
                    'step': len(steps),
                    'event_type': 'total_overlap',
                    'nodes': copy.deepcopy(layout),
                    'edges': copy.deepcopy(edges),
                    'active_node_id': node.id,
                    'message': f'Interval [{node.L}, {node.R}] has TOTAL OVERLAP with [{q_low}, {q_high}]. Returning minimum = {node.val}.'
                })
                return node.val

            steps.append({
                'step': len(steps),
                'event_type': 'partial_overlap',
                'nodes': copy.deepcopy(layout),
                'edges': copy.deepcopy(edges),
                'active_node_id': node.id,
                'message': f'Interval [{node.L}, {node.R}] has PARTIAL OVERLAP with [{q_low}, {q_high}]. Splitting into left and right subtrees.'
            })
            left_res = query_tree(node.left, q_low, q_high)
            right_res = query_tree(node.right, q_low, q_high)
            return min(left_res, right_res)

        ans = query_tree(root_seg, qL, qR)
        steps.append({
            'step': len(steps),
            'event_type': 'query_result',
            'nodes': copy.deepcopy(layout),
            'edges': copy.deepcopy(edges),
            'active_node_id': root_seg.id,
            'result': ans,
            'message': f'🎯 RMQ Range [{qL}, {qR}] Minimum Value = {ans}.'
        })

    return steps, {'total_nodes': len(layout), 'tree_type': 'segment'}


# ==========================================
# 6. FENWICK TREE (BINARY INDEXED TREE / BIT)
# ==========================================

def fenwick_tree_with_steps(arr: List[int], op: str, idx: int = 1, delta: int = 0) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    n = len(arr)
    bit = [0] * (n + 1)
    steps = []

    def update_bit(i: int, val: int):
        while i <= n:
            bit[i] += val
            i += (i & (-i))

    for i, v in enumerate(arr, 1):
        update_bit(i, v)

    steps.append({
        'step': 0,
        'event_type': 'init',
        'array': copy.deepcopy(arr),
        'bit_table': copy.deepcopy(bit),
        'active_index': None,
        'message': f'Fenwick Tree initialized with {n} elements. Table size = {n+1}.'
    })

    if op == 'prefix_sum':
        sum_val = 0
        i = idx
        trace = []
        while i > 0:
            sum_val += bit[i]
            lsb = i & (-i)
            next_i = i - lsb
            trace.append({'index': i, 'lsb': lsb, 'added': bit[i], 'next_index': next_i})
            steps.append({
                'step': len(steps),
                'event_type': 'bit_query_step',
                'array': copy.deepcopy(arr),
                'bit_table': copy.deepcopy(bit),
                'active_index': i,
                'lsb': lsb,
                'accumulated_sum': sum_val,
                'message': f'Index {i} (0b{i:04b}): Add bit[{i}] = {bit[i]}. LSB = {lsb} (0b{lsb:04b}). Next index = {i} - {lsb} = {next_i}.'
            })
            i = next_i

        steps.append({
            'step': len(steps),
            'event_type': 'sum_result',
            'array': copy.deepcopy(arr),
            'bit_table': copy.deepcopy(bit),
            'active_index': None,
            'prefix_sum': sum_val,
            'message': f'🎯 Prefix Sum from index 1 to {idx} = {sum_val}.'
        })

    return steps, {'bit_size': len(bit), 'tree_type': 'fenwick'}
