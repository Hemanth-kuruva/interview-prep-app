-- ====================================================================
-- TechPrep - Technical Interview Preparation Database Schema & Seeds
-- ====================================================================

CREATE DATABASE IF NOT EXISTS interview_prep_db;
USE interview_prep_db;

-- --------------------------------------------------------------------
-- 1. Users Table
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS user_answers;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 2. Subjects Table
-- --------------------------------------------------------------------
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'BookOpen',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 3. Questions Table
-- --------------------------------------------------------------------
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 4. Quiz Attempts Table
-- --------------------------------------------------------------------
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    mode ENUM('practice', 'quiz') DEFAULT 'quiz',
    difficulty VARCHAR(50) DEFAULT 'All',
    score INT NOT NULL,
    total_questions INT NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_taken INT DEFAULT 0, -- in seconds
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- 5. User Answers Table (Detailed Review)
-- --------------------------------------------------------------------
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    CONSTRAINT fk_user_answers_attempt FOREIGN KEY (attempt_id) 
        REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_answers_question FOREIGN KEY (question_id) 
        REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- Demo Users
-- Passwords:
-- admin@interviewprep.com  -> admin123 ($2a$10$qR6i0pGz67yYwZ1EOmH44.r9eZ5X5bYp4w2N9G8g0Lh.9A6iJkK7Q)
-- student@interviewprep.com -> student123 ($2a$10$wE8wM6sC73wzC2k7wE8wMeZ5X5bYp4w2N9G8g0Lh.9A6iJkK7Qj0a)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Administrator', 'admin@interviewprep.com', '$2a$10$bSg7mB7cW60bYyQeK1e12eN5EwE2xN2yQO0gV.fO5L7S.Z0TjG2eq', 'admin'),
(2, 'Alex Johnson', 'student@interviewprep.com', '$2a$10$bSg7mB7cW60bYyQeK1e12eN5EwE2xN2yQO0gV.fO5L7S.Z0TjG2eq', 'student');

-- Pre-defined Subjects
INSERT INTO subjects (id, name, slug, icon, description) VALUES
(1, 'SQL', 'sql', 'Database', 'Query optimization, joins, aggregations, indexing, window functions, and schema design.'),
(2, 'Java', 'java', 'Coffee', 'Core OOPs concepts, Collections framework, Multi-threading, JVM internals, and Streams API.'),
(3, 'DBMS', 'dbms', 'Server', 'ACID properties, Normalization, Transactions, B-Trees, Concurrency control, and ER modeling.'),
(4, 'Operating Systems', 'os', 'Cpu', 'Process scheduling, Threads, Deadlocks, Virtual Memory, Paging, and IPC.'),
(5, 'Computer Networks', 'cn', 'Network', 'OSI model, TCP/IP, DNS, HTTP/HTTPS, Subnetting, Congestion control, and Sockets.'),
(6, 'Machine Learning', 'ml', 'Brain', 'Supervised & unsupervised learning, evaluation metrics, deep learning basics, and model evaluation.'),
(7, 'Coding & DSA', 'coding', 'Code2', 'Data structures, algorithms, time-space complexities, dynamic programming, and recursion.');

-- Seed Technical Interview Questions
INSERT INTO questions (subject_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation) VALUES
-- SQL Questions
(1, 'How do you find the 2nd highest salary from an Employee table in standard SQL?', 
 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);', 
 'SELECT salary FROM Employee ORDER BY salary DESC LIMIT 2;', 
 'SELECT TOP 2 salary FROM Employee ORDER BY salary DESC;', 
 'SELECT salary FROM Employee WHERE ROWNUM = 2 ORDER BY salary DESC;', 
 'A', 'Medium', 'Using a subquery to find the maximum salary strictly less than the overall maximum correctly retrieves the 2nd highest salary regardless of ties.'),

(1, 'Which SQL clause is executed FIRST in query processing order?', 
 'SELECT', 
 'WHERE', 
 'FROM', 
 'HAVING', 
 'C', 'Easy', 'The logical query processing order starts with FROM (including JOINs), followed by WHERE, GROUP BY, HAVING, SELECT, DISTINCT, and ORDER BY.'),

(1, 'What is the difference between TRUNCATE and DELETE in SQL?', 
 'DELETE is a DDL command while TRUNCATE is a DML command', 
 'TRUNCATE is a DDL command that resets identity columns and cannot be easily rolled back without active transactions, whereas DELETE is DML and logs per row', 
 'TRUNCATE allows a WHERE clause while DELETE does not', 
 'Both are identical in performance and transactional logging', 
 'B', 'Medium', 'TRUNCATE deallocates data pages (DDL, faster, resets auto-increment), whereas DELETE logs individual row deletions (DML, can use WHERE).'),

(1, 'Which window function produces ranking without leaving gaps for tie scores?', 
 'RANK()', 
 'ROW_NUMBER()', 
 'DENSE_RANK()', 
 'NTILE()', 
 'C', 'Hard', 'DENSE_RANK() assigns consecutive rank values when ties occur (e.g. 1, 2, 2, 3), whereas RANK() skips the next rank (e.g. 1, 2, 2, 4).'),

(1, 'What kind of index stores table data physically sorted on the indexed column?', 
 'Non-clustered Index', 
 'Clustered Index', 
 'Bitmap Index', 
 'Full-Text Index', 
 'B', 'Easy', 'A Clustered Index determines the physical order of data in the table. Hence, there can only be one Clustered Index per table.'),

-- Java Questions
(2, 'Why is the String class immutable in Java?', 
 'For Security, Thread Safety, and String Pool caching', 
 'Because it extends Object directly', 
 'To prevent garbage collection', 
 'Because primitive wrappers are mutable', 
 'A', 'Medium', 'String immutability ensures safety across multi-threaded applications, enables String Constant Pool reuse, and prevents unauthorized parameter tampering.'),

(2, 'What is the contract between equals() and hashCode() in Java?', 
 'If two objects are equal according to equals(), they MUST return the same hashCode()', 
 'If two objects have the same hashCode(), they must be equal according to equals()', 
 'hashCode() is only used in ArrayList', 
 'There is no relationship between them', 
 'A', 'Hard', 'If obj1.equals(obj2) is true, then obj1.hashCode() == obj2.hashCode() MUST hold true for hash-based collections (HashMap, HashSet) to function properly.'),

(2, 'Which collection class in Java does NOT allow duplicate elements and maintains insertion order?', 
 'HashSet', 
 'TreeSet', 
 'LinkedHashSet', 
 'PriorityQueue', 
 'C', 'Easy', 'LinkedHashSet maintains a doubly-linked list across its entries, ensuring elements are unique and iterated in insertion order.'),

(2, 'What happens if a static method is declared in both a parent class and a child class with the same signature?', 
 'Method Overriding', 
 'Method Hiding', 
 'Compilation Error', 
 'Runtime Exception', 
 'B', 'Medium', 'Static methods in Java cannot be overridden; rather, the subclass method hides the parent static method (Method Hiding resolved at compile time).'),

(2, 'What is the default initial capacity and load factor of a standard Java HashMap?', 
 'Capacity: 10, Load Factor: 0.5', 
 'Capacity: 16, Load Factor: 0.75', 
 'Capacity: 32, Load Factor: 0.8', 
 'Capacity: 8, Load Factor: 1.0', 
 'B', 'Easy', 'Java HashMap defaults to an initial capacity of 16 (2^4) with a load factor of 0.75 (resizes when 75% full).'),

-- DBMS Questions
(3, 'Which normal form eliminates partial dependency on a composite primary key?', 
 '1NF', 
 '2NF', 
 '3NF', 
 'BCNF', 
 'B', 'Easy', 'Second Normal Form (2NF) requires 1NF compliance and that all non-key attributes are fully functionally dependent on the entire primary key.'),

(3, 'What does the Isolation level "Serializable" prevent in DBMS transactions?', 
 'Dirty Reads only', 
 'Dirty Reads and Non-Repeatable Reads only', 
 'Dirty Reads, Non-Repeatable Reads, and Phantom Reads', 
 'Deadlocks exclusively', 
 'C', 'Hard', 'Serializable is the highest isolation level and prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads by executing transactions sequentially.'),

(3, 'What is the primary advantage of a B+ Tree over a B Tree in database indexing?', 
 'B+ Trees store data pointers only in leaf nodes, making range queries faster via sequential linked lists', 
 'B+ Trees have fewer levels than B Trees always', 
 'B+ Trees require zero disk I/O', 
 'B+ Trees do not support binary search', 
 'A', 'Medium', 'In B+ trees, all records are stored in leaf nodes connected by a linked list, enabling highly efficient sequential scans and range queries.'),

(3, 'What is the ACID property that guarantees a transaction is treated as a single indivisible unit of work?', 
 'Atomicity', 
 'Consistency', 
 'Isolation', 
 'Durability', 
 'A', 'Easy', 'Atomicity ensures that either all operations in a transaction succeed (Commit) or none of them do (Rollback).'),

(3, 'What does the Write-Ahead Logging (WAL) protocol ensure in database systems?', 
 'Logs are written to non-volatile storage before corresponding database modifications are applied to disk', 
 'Data is written before logging to save memory', 
 'Queries are executed in parallel without locks', 
 'Indexes are rebuilt automatically after each INSERT', 
 'A', 'Medium', 'WAL guarantees durability and recovery by ensuring that log records describing changes are flushed to disk before dirty pages are written.'),

-- Operating Systems Questions
(4, 'Which of the following conditions is NOT required for a deadlock to occur (Coffman Conditions)?', 
 'Mutual Exclusion', 
 'Hold and Wait', 
 'Preemption allowed', 
 'Circular Wait', 
 'C', 'Medium', 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlocks cannot persist.'),

(4, 'What is the phenomenon called when excessive paging causes the OS to spend more time swapping pages than executing instructions?', 
 'Segmentation Fault', 
 'Belady’s Anomaly', 
 'Thrashing', 
 'Context Switching', 
 'C', 'Easy', 'Thrashing occurs when the system spends more time servicing page faults and swapping pages in/out of secondary storage than doing productive CPU execution.'),

(4, 'Which CPU scheduling algorithm is non-preemptive and optimal for minimizing average waiting time?', 
 'First-Come, First-Served (FCFS)', 
 'Shortest Job First (SJF)', 
 'Round Robin (RR)', 
 'Priority Scheduling', 
 'B', 'Medium', 'Shortest Job First (SJF) is provably optimal for minimizing average waiting time when all burst times are known in advance.'),

(4, 'What is Belady’s Anomaly in Operating Systems?', 
 'Increasing the number of page frames causes more page faults in FIFO replacement', 
 'Processes entering deadlock randomly', 
 'CPU utilization dropping to zero under heavy load', 
 'LRU page replacement performing worse than FIFO', 
 'A', 'Hard', 'Belady’s Anomaly is a counter-intuitive behavior in the FIFO page replacement algorithm where allocating more frames increases page faults.'),

(4, 'What is stored in a Process Control Block (PCB)?', 
 'Process State, Program Counter, CPU Registers, and Memory Limits', 
 'Only user input commands', 
 'Kernel source code binary', 
 'Network packet payloads', 
 'A', 'Easy', 'A PCB contains all execution metadata for a process: PID, state, PC, register contents, memory limits, and I/O status info.'),

-- Computer Networks Questions
(5, 'What is the standard 3-way handshake sequence to establish a TCP connection?', 
 'SYN -> SYN-ACK -> ACK', 
 'ACK -> SYN -> SYN-ACK', 
 'FIN -> ACK -> FIN-ACK', 
 'PING -> PONG -> ACK', 
 'A', 'Easy', 'TCP connection establishment uses SYN (client), SYN-ACK (server response), and ACK (client confirmation).'),

(5, 'Which layer in the OSI model is responsible for end-to-end reliability and flow control?', 
 'Network Layer', 
 'Data Link Layer', 
 'Transport Layer', 
 'Session Layer', 
 'C', 'Easy', 'The Transport Layer (Layer 4, e.g. TCP) is responsible for end-to-end communication, segmentation, flow control, and error recovery.'),

(5, 'What protocol is used to map an IP address to a physical MAC address on a local network?', 
 'DNS', 
 'ARP (Address Resolution Protocol)', 
 'DHCP', 
 'ICMP', 
 'B', 'Medium', 'ARP resolves Layer 3 IPv4 addresses into corresponding Layer 2 physical MAC addresses within a broadcast domain.'),

(5, 'What is the purpose of the TTL (Time to Live) field in an IPv4 packet header?', 
 'To encrypt packet data', 
 'To prevent packets from looping endlessly in the network', 
 'To specify transmission speed', 
 'To calculate TCP checksum', 
 'B', 'Medium', 'TTL is decremented by 1 at every router hop. When it reaches 0, the packet is discarded and an ICMP Time Exceeded message is sent back.'),

(5, 'What is the default port number for HTTPS secure web communication?', 
 '80', 
 '443', 
 '8080', 
 '22', 
 'A', 'Easy', 'HTTPS uses TCP port 443 by default, whereas unencrypted HTTP uses port 80.');

-- Machine Learning Questions
INSERT INTO questions (subject_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation) VALUES
(6, 'Which metric is best suited for evaluating a classification model on an imbalanced dataset?', 
 'Accuracy', 
 'F1-Score / PR-AUC', 
 'Mean Squared Error', 
 'R-squared', 
 'B', 'Medium', 'Accuracy is misleading for imbalanced datasets. F1-Score (harmonic mean of Precision and Recall) or PR-AUC provides a much truer assessment.'),

(6, 'What is the main purpose of L2 Regularization (Ridge) in linear models?', 
 'It drives non-essential weights strictly to zero (feature selection)', 
 'It penalizes large weight magnitudes by adding the squared sum of weights to the loss function', 
 'It removes outliers from the dataset automatically', 
 'It increases training variance', 
 'B', 'Medium', 'L2 regularization adds a penalty proportional to the square of weights, preventing model overfitting and shrinking weights evenly.'),

(6, 'What problem occurs when the gradient becomes exponentially small during backpropagation in deep networks?', 
 'Exploding Gradient Problem', 
 'Vanishing Gradient Problem', 
 'Overfitting', 
 'Curse of Dimensionality', 
 'B', 'Easy', 'The Vanishing Gradient Problem occurs when derivative chains (e.g. from Sigmoid/Tanh) produce tiny multipliers, preventing early layers from updating.'),

(6, 'What is the difference between Bagging and Boosting ensemble methods?', 
 'Bagging trains models in parallel to reduce variance; Boosting trains models sequentially to reduce bias', 
 'Bagging uses only decision trees while Boosting uses only neural networks', 
 'Bagging reduces bias while Boosting reduces variance', 
 'They are identical algorithms under different names', 
 'A', 'Hard', 'Bagging (e.g. Random Forest) averages independent parallel models to lower variance; Boosting (e.g. XGBoost, AdaBoost) trains iteratively on mistakes to lower bias.'),

(6, 'Which activation function is most widely used in hidden layers of modern deep neural networks to mitigate vanishing gradients?', 
 'Sigmoid', 
 'ReLU (Rectified Linear Unit)', 
 'Step Function', 
 'Softmax', 
 'B', 'Easy', 'ReLU computes max(0, x) and has a constant derivative of 1 for positive inputs, avoiding gradient saturation in deep networks.');

-- Coding & DSA Questions
INSERT INTO questions (subject_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation) VALUES
(7, 'What is the average and worst-case time complexity of QuickSort?', 
 'Average: O(n log n), Worst: O(n^2)', 
 'Average: O(n), Worst: O(n log n)', 
 'Average: O(n^2), Worst: O(n^2)', 
 'Average: O(n log n), Worst: O(n log n)', 
 'A', 'Easy', 'QuickSort has an average complexity of O(n log n), but degrades to O(n^2) in the worst case when poor pivots (like smallest/largest) are chosen repeatedly.'),

(7, 'Which data structure is most suitable for detecting cycles in a directed graph using Kahn’s Algorithm?', 
 'Queue (with in-degree tracking)', 
 'Stack only', 
 'Min-Heap', 
 'Disjoint Set Union (DSU) without modifications', 
 'A', 'Medium', 'Kahn’s Algorithm uses a Queue and calculates in-degrees of nodes to perform Topological Sort; remaining unprocessed nodes indicate a cycle.'),

(7, 'What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?', 
 'O(1)', 
 'O(log n)', 
 'O(n)', 
 'O(n log n)', 
 'B', 'Easy', 'Self-balancing BSTs guarantee a maximum tree height of O(log n), ensuring search, insert, and delete operations execute in O(log n) time.'),

(7, 'Which technique is used to solve the "0/1 Knapsack Problem" in optimal O(N * W) time?', 
 'Greedy Approach', 
 'Dynamic Programming', 
 'Divide and Conquer with simple recursion', 
 'Two Pointer Technique', 
 'B', 'Medium', '0/1 Knapsack exhibits overlapping subproblems and optimal substructure, solved using 2D or 1D Dynamic Programming in O(N * W) time.'),

(7, 'What is the space complexity of Depth First Search (DFS) on a binary tree with height H?', 
 'O(1)', 
 'O(H)', 
 'O(N^2)', 
 'O(log H)', 
 'B', 'Medium', 'The recursive call stack in DFS consumes space proportional to the height of the tree H (which is O(log N) for balanced trees and O(N) for skewed trees).');

-- Seed Sample Quiz Attempt for demo student
INSERT INTO quiz_attempts (id, user_id, subject_id, mode, difficulty, score, total_questions, accuracy, time_taken, attempted_at) VALUES
(1, 2, 1, 'quiz', 'Medium', 4, 5, 80.00, 142, NOW() - INTERVAL 2 DAY),
(2, 2, 2, 'quiz', 'All', 3, 5, 60.00, 185, NOW() - INTERVAL 1 DAY),
(3, 2, 3, 'practice', 'Easy', 5, 5, 100.00, 95, NOW() - INTERVAL 4 HOUR);

INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct) VALUES
(1, 1, 'A', 1),
(1, 2, 'C', 1),
(1, 3, 'B', 1),
(1, 4, 'A', 0),
(1, 5, 'B', 1);
