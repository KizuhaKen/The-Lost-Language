/*:
@target MZ
@plugindesc Displays HP bars above front-facing enemies with full customization support. [by XyScripts]
@author XyScripts

@param Bar Width
@type number
@default 100
@desc Width of the HP bar.

@param Bar Height
@type number
@default 8
@desc Height of the HP bar.

@param Bar Y Offset
@type number
@default -110
@desc Vertical offset of the HP bar from the enemy sprite.

@param Background Color
@type string
@default #000000
@desc Color of the background portion of the bar.

@param Fill Color
@type string
@default #ff0000
@desc Color of the HP fill portion of the bar.

@param Border Color
@type string
@default #ffffff
@desc Optional border color drawn around the bar.

@param Show Only When Damaged
@type boolean
@default false
@desc If true, HP bars only appear once the enemy takes damage.

@param Hide On Full HP
@type boolean
@default false
@desc If true, hides the bar when enemy is at full HP.

@param Opacity
@type number
@min 0
@max 255
@default 255
@desc Opacity of the HP bar (0 = invisible, 255 = fully visible)

@param Z Index
@type number
@default 9
@desc Z-layer index priority for drawing bars above sprites.

@help
This plugin displays HP bars above enemy sprites in RPG Maker MZ.

It is designed to be compatible with front-facing animated enemies like those from the Xy_AnimatedFrontEnemy plugin.

Parameters allow customization of position, size, color, visibility behavior, opacity, and rendering layer.

No note tags required.
*/

(() => {
  const parameters = PluginManager.parameters("Xy_EnemyHpBar");

  const BAR_WIDTH = Number(parameters["Bar Width"] || 100);
  const BAR_HEIGHT = Number(parameters["Bar Height"] || 8);
  const BAR_Y_OFFSET = Number(parameters["Bar Y Offset"] || -110);
  const COLOR_BG = String(parameters["Background Color"] || "#000000");
  const COLOR_FILL = String(parameters["Fill Color"] || "#ff0000");
  const COLOR_BORDER = String(parameters["Border Color"] || "#ffffff");
  const SHOW_ON_DAMAGE = parameters["Show Only When Damaged"] === "true";
  const HIDE_FULL_HP = parameters["Hide On Full HP"] === "true";
  const BAR_OPACITY = Number(parameters["Opacity"] || 255);
  const Z_INDEX = Number(parameters["Z Index"] || 9);

  class Sprite_EnemyHpBar extends Sprite {
    constructor(battler, parent) {
      super();
      this._battler = battler;
      this._parentSprite = parent;
      this._hp = battler.hp;
      this._mhp = battler.mhp;
      this.bitmap = new Bitmap(BAR_WIDTH, BAR_HEIGHT);
      this.anchor.x = 0.5;
      this.anchor.y = 1;
      this.opacity = BAR_OPACITY;
      this.z = Z_INDEX;
      parent.addChild(this);
      this.updatePosition();
      this.refresh();
    }

    update() {
      super.update();
      if (!this._battler || this._battler.isDead()) {
        this.visible = false;
        return;
      }

      if (SHOW_ON_DAMAGE && this._battler.hp >= this._battler.mhp) {
        this.visible = false;
        return;
      }

      if (HIDE_FULL_HP && this._battler.hp === this._battler.mhp) {
        this.visible = false;
        return;
      }

      this.visible = true;
      if (this._battler.hp !== this._hp || this._battler.mhp !== this._mhp) {
        this._hp = this._battler.hp;
        this._mhp = this._battler.mhp;
        this.refresh();
      }

      this.updatePosition();
    }

    updatePosition() {
      this.x = this._parentSprite.width / 2;
      this.y = BAR_Y_OFFSET;
    }

    refresh() {
      const rate = Math.max(0, Math.min(1, this._battler.hp / this._battler.mhp));
      this.bitmap.clear();

      // Background
      this.bitmap.fillRect(0, 0, BAR_WIDTH, BAR_HEIGHT, COLOR_BG);

      // Fill
      this.bitmap.fillRect(0, 0, BAR_WIDTH * rate, BAR_HEIGHT, COLOR_FILL);

      // Optional border
      if (COLOR_BORDER.toLowerCase() !== "none") {
        this.bitmap.strokeRect(0, 0, BAR_WIDTH, BAR_HEIGHT, COLOR_BORDER);
      }
    }
  }

  const _Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
  Sprite_Enemy.prototype.setBattler = function(battler) {
    _Sprite_Enemy_setBattler.call(this, battler);
    if (battler && battler.enemy) {
      if (!this._hpBarSprite) {
        this._hpBarSprite = new Sprite_EnemyHpBar(battler, this);
      }
    }
  };

  const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
  Sprite_Enemy.prototype.update = function () {
    _Sprite_Enemy_update.call(this);
    if (this._hpBarSprite) {
      this._hpBarSprite.update();
    }
  };
})();
