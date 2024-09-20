// @ts-check

import { copyProps } from "./jsutils";

//xxxTODO: Create a mechanism to automate the creation of a class hierarchy,
// specifying base class, shared props, instance props.
/**
 * Base object
 * @constructor
 * @param {Record<string, any>} props
 * @param {boolean} [asProto]
 */
export function CivObj(props, asProto) {
  if (!(this instanceof CivObj)) {
    console.log("ues");
    return new CivObj(props);
  } // Prevent accidental namespace pollution
  //xxx Should these just be taken off the prototype's property names?
  var names = asProto
    ? null
    : [
        "id",
        "name",
        "subType",
        "owned",
        "prereqs",
        "require",
        "salable",
        "vulnerable",
        "effectText",
        "prestige",
        "initOwned",
        "init",
        "reset",
        "limit",
        "hasVariableCost",
      ];
  Object.call(this, props);
  copyProps(this, props, names, true);
  return this;
}

// Common Properties: id, name, owned, prereqs, require, effectText,
//xxx TODO: Add save/load methods.
CivObj.prototype = {
  constructor: CivObj,
  subType: "normal",

  get data() {
    return window.curCiv[this.id];
  },
  set data(value) {
    window.curCiv[this.id] = value;
  },
  get owned() {
    return this.data.owned;
  },
  set owned(value) {
    this.data.owned = value;
  },
  prereqs: {},
  require: {}, // Default to free.  If this is undefined, makes the item unpurchaseable
  salable: false,
  vulnerable: true,
  effectText: "",
  prestige: false,
  initOwned: 0, // Override this to undefined to inhibit initialization.  Also determines the type of the 'owned' property.
  init: function (fullInit) {
    if (fullInit === undefined) {
      fullInit = true;
    }
    if (fullInit || !this.prestige) {
      this.data = {};
      if (this.initOwned !== undefined) {
        this.owned = this.initOwned;
      }
    }
    return true;
  },
  reset: function () {
    return this.init(false);
  }, // Default reset behavior is to re-init non-prestige items.
  get limit() {
    return typeof this.initOwned == "number"
      ? Infinity // Default is no limit for numbers
      : typeof this.initOwned == "boolean"
        ? true
        : 0;
  }, // true (1) for booleans, 0 otherwise.
  //xxx This is a hack; it assumes that any CivObj with a getter for its
  // 'require' has a variable cost.  Which is currently true, but might not
  // always be.
  hasVariableCost: function () {
    var i;
    // If our requirements have a getter, assume variable.
    //xxx This won't work if it inherits a variable desc.
    var requireDesc = Object.getOwnPropertyDescriptor(this, "require");
    if (!requireDesc) {
      return false;
    } // Unpurchaseable
    if (requireDesc.get !== undefined) {
      return true;
    }
    // If our requirements contain a function, assume variable.
    for (i in this.require) {
      if (typeof this.require[i] == "function") {
        return true;
      }
    }
    return false;
  },

  // Return the name for the given quantity of this object.
  // Specific 'singular' and 'plural' used if present and appropriate,
  // otherwise returns 'name'.
  getQtyName: function (qty) {
    // @ts-expect-error
    if (qty === 1 && this.singular) {
      // @ts-expect-error
      return this.singular;
    }
    // @ts-expect-error
    if (typeof qty == "number" && this.plural) {
      // @ts-expect-error
      return this.plural;
    }
    // @ts-expect-error
    return this.name || this.singular || "(UNNAMED)";
  },
};
