class WaterChemistry {
  constructor() {
    this.ammonia = 0;
    this.nitrite = 0;
    this.nitrate = 10;
    this.pH = 7.0;
    this.temperature = 22;
    this.dissolvedOxygen = 8.0;
  }

  update(ammoniaInput, plantAbsorption, biofilterEfficiency) {
    this.ammonia += ammoniaInput;
    this.nitrite = this.ammonia * biofilterEfficiency;
    this.nitrate += this.nitrite * biofilterEfficiency;
    this.ammonia = 0;
    this.nitrite = 0;
    this.pH -= 0.01 * (ammoniaInput - plantAbsorption);
    this.pH = Math.max(6.0, Math.min(8.0, this.pH));
  }

  getStatus() {
    return {
      ammonia: Number(this.ammonia.toFixed(2)),
      nitrite: Number(this.nitrite.toFixed(2)),
      nitrate: Number(this.nitrate.toFixed(2)),
      pH: Number(this.pH.toFixed(2)),
      temperature: Number(this.temperature.toFixed(2)),
      dissolvedOxygen: Number(this.dissolvedOxygen.toFixed(2))
    };
  }
}

module.exports = { WaterChemistry };
