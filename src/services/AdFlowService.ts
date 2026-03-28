export default class AdFlowService
{
    static matchCount = 0
    static lastAdMatch = -999

    static shouldShowInterstitial(): boolean
    {
        this.matchCount++

        // 1. İlk oyun → reklam yok
        if (this.matchCount === 1)
            return false

        const sinceLastAd = this.matchCount - this.lastAdMatch

        // 2. Cooldown (en az 2 maç boşluk)
        if (sinceLastAd < 2)
            return false

        // 3. Fail-safe (3 maçtır reklam yoksa zorla)
        if (sinceLastAd >= 3)
        {
            this.lastAdMatch = this.matchCount
            return true
        }

        // 4️⃣ Random (oyuna göre oran değişir)
        let chance = 0.8

        // 2. oyun → %15
        if (this.matchCount === 2)
            chance = 0.15

        // 3. oyun → %45 (biraz agresif)
        else if (this.matchCount === 3)
            chance = 0.45

        if (Math.random() < chance)
        {
            this.lastAdMatch = this.matchCount
            return true
        }

        return false
    }
}