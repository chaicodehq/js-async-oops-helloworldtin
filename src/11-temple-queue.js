/**
 * 🛕 Mandir Darshan Queue - Static Methods, Getters/Setters, Symbol.iterator
 *
 * Mandir mein darshan ke liye queue management system banana hai! Advanced
 * OOP features use karo — getters/setters se controlled access, static
 * methods se utility functions, aur Symbol.iterator se queue ko for...of
 * loop mein iterate karo. VIP devotees ko special treatment milega!
 *
 * Class: TempleQueue
 *
 *   Private Fields:
 *     #devotees    - Array of devotee objects
 *     #maxCapacity - Maximum queue capacity
 *     #vipEnabled  - Boolean: VIP lane active or not
 *
 *   constructor(templeName, maxCapacity)
 *     - this.templeName = templeName (public)
 *     - this.#devotees = []
 *     - this.#maxCapacity = maxCapacity (must be > 0, default 100)
 *     - this.#vipEnabled = false
 *
 *   Getters:
 *     get length()     - Returns number of devotees in queue
 *     get isEmpty()    - Returns true if queue has no devotees
 *     get vipEnabled() - Returns current VIP enabled status
 *
 *   Setters:
 *     set vipEnabled(value)
 *       - Only accepts boolean values
 *       - If non-boolean passed, throw TypeError("VIP status must be a boolean")
 *       - Sets this.#vipEnabled
 *
 *   Instance Methods:
 *
 *     enqueue(name, type)
 *       - type: "regular" or "vip"
 *       - If type invalid (not "regular" or "vip"): return null
 *       - If name is empty/falsy: return null
 *       - If queue is full (#devotees.length >= #maxCapacity): return null
 *       - Creates devotee: { name, type, joinedAt: new Date().toISOString() }
 *       - If type is "vip" AND #vipEnabled is true: add to FRONT of queue (unshift)
 *       - If type is "vip" AND #vipEnabled is false: treat as regular (add to back)
 *       - If type is "regular": add to BACK of queue (push)
 *       - Returns the devotee object
 *
 *     dequeue()
 *       - Removes and returns the FIRST devotee from queue
 *       - Returns null if queue is empty
 *
 *     peek()
 *       - Returns the FIRST devotee WITHOUT removing
 *       - Returns null if queue is empty
 *
 *     contains(name)
 *       - Returns true if a devotee with that name is in the queue
 *       - Returns false otherwise
 *
 *     toArray()
 *       - Returns a COPY of the devotees array
 *       - Modifying returned array should not affect internal queue
 *
 *   Static Methods:
 *
 *     static merge(queue1, queue2)
 *       - Takes two TempleQueue instances
 *       - Creates a NEW TempleQueue with name "${queue1.templeName}-${queue2.templeName}"
 *       - maxCapacity = queue1's capacity + queue2's capacity (use length as approximation
 *         or accept sum of both toArray lengths + some buffer)
 *       - Adds all devotees from queue1 first, then queue2 (maintaining order)
 *       - Returns the new merged queue
 *
 *     static fromArray(templeName, maxCapacity, arr)
 *       - Creates a new TempleQueue from an array of name strings
 *       - Each name becomes a "regular" type devotee
 *       - Returns the new queue
 *       - If arr is not an array, return empty queue
 *
 *   Iterator:
 *
 *     [Symbol.iterator]()
 *       - Makes the queue iterable with for...of
 *       - Yields each devotee object in order (front to back)
 *       - Does NOT remove devotees (non-destructive iteration)
 *
 * Rules:
 *   - Private fields must use # syntax
 *   - Getters/setters must use get/set keyword syntax
 *   - Static methods must use static keyword
 *   - Symbol.iterator must be implemented as a generator or return iterator protocol
 *   - VIP enqueue only works when vipEnabled is true
 *   - Queue should never exceed maxCapacity
 *   - toArray and merge should return copies, not references
 *   - fromArray creates regular devotees only
 *
 * @example
 *   const queue = new TempleQueue("Kashi Vishwanath", 50);
 *   queue.enqueue("Ram", "regular");
 *   queue.enqueue("Shyam", "regular");
 *   queue.length;     // => 2
 *   queue.isEmpty;    // => false
 *
 *   queue.vipEnabled = true;
 *   queue.enqueue("VIP Sharma", "vip");
 *   queue.peek();     // => { name: "VIP Sharma", type: "vip", ... } (front!)
 *
 *   queue.dequeue();  // => { name: "VIP Sharma", ... }
 *   queue.length;     // => 2
 *
 * @example
 *   const q = TempleQueue.fromArray("Test Mandir", 10, ["A", "B", "C"]);
 *   q.length;  // => 3
 *
 * @example
 *   const queue = new TempleQueue("Mandir", 10);
 *   queue.enqueue("A", "regular");
 *   queue.enqueue("B", "regular");
 *   for (const devotee of queue) {
 *     console.log(devotee.name);  // "A", then "B"
 *   }
 */
export class TempleQueue {
  #devotees;
  #maxCapacity;
  #vipEnabled;

  constructor(templeName, maxCapacity) {
    this.templeName = templeName;
    this.#devotees = [];
    this.#maxCapacity = maxCapacity;
    this.#vipEnabled = false;
  }

  get length() {
    return this.#devotees.length;
  }

  get isEmpty() {
    return this.#devotees.length === 0;
  }

  get vipEnabled() {
    return this.#vipEnabled;
  }

  set vipEnabled(value) {
    if (typeof value !== "boolean")
      throw TypeError("VIP status must be a boolean");

    this.#vipEnabled = value;
  }

  enqueue(name, type) {
    if (type !== "regular" && type !== "vip") return null;

    if (!name) return null;

    if (this.#devotees.length >= this.#maxCapacity) return null;

    const devotee = { name, type, joinedAt: new Date().toISOString() };

    if (type === "vip" && this.#vipEnabled) {
      this.#devotees.unshift(devotee);
    }

    this.#devotees.push(devotee);

    return devotee;
  }

  dequeue() {
    if (this.#devotees.length === 0) return null;

    const firstDevote = this.#devotees.shift();
    return firstDevote;
  }

  peek() {
    if (this.#devotees.length === 0) return null;
    return this.#devotees[0];
  }

  contains(name) {
    for (const devotee of this.#devotees) {
      if (devotee.name === name) return true;
    }
    return false;
  }

  toArray() {
    return [...this.#devotees];
  }

  static merge(queue1, queue2) {
    const name = `${queue1.templeName}-${queue2.templeName}`;
    const maxCapacity = queue1.toArray().length + queue2.toArray().length;

    const newTemple = new TempleQueue(name, maxCapacity);

    for (const devotee of queue1.toArray()) {
      newTemple.enqueue(devotee.name, devotee.type);
    }
    for (const devotee of queue2.toArray()) {
      newTemple.enqueue(devotee.name, devotee.type);
    }
    return newTemple;
  }

  static fromArray(templeName, maxCapacity, arr) {
    const queue = new TempleQueue(templeName, maxCapacity);
    if (!Array.isArray(arr)) return queue;

    for (const name of arr) {
      queue.enqueue(name, "regular", new Date().toISOString());
    }
    return queue;
  }

  [Symbol.iterator]() {
    let currIndex = 0;
    const devotees = this.#devotees;
    return {
      next() {
        if (currIndex < devotees.length) {
          return { done: false, value: devotees[currIndex++] };
        } else {
          return { done: true };
        }
      },
    };
  }
}
