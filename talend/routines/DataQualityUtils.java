package routines;

/**
 * Routines Talend — qualité de données PetfoodTN / clients.
 * À importer dans TOS DI : Code → Routines → Create routine.
 */
public class DataQualityUtils {

    /** Seuil bas outlier montant d'achat (inclus). */
    public static final double MONTANT_MIN = 0.0;

    /** Seuil haut outlier montant d'achat (exclus). */
    public static final double MONTANT_MAX = 10000.0;

    /** Valeur par défaut si outlier (null côté métier ; 0.0 pour Double non-nullable). */
    public static final Double MONTANT_DEFAUT = null;

    /**
     * Prix d'achat : virgule → point, puis Double.
     * Exemple tMap : DataQualityUtils.toDoublePrix(row1.MontantAchat)
     */
    public static Double toDoublePrix(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        if (s.isEmpty()) {
            return null;
        }
        // "1 234,56" ou "1234,56" → "1234.56"
        s = s.replace(" ", "").replace('\u00A0', ' ').replace(" ", "");
        s = s.replace(',', '.');
        // Si plusieurs points (ex. 1.234.56), garder le dernier comme décimal
        int lastDot = s.lastIndexOf('.');
        if (lastDot > 0 && s.indexOf('.') != lastDot) {
            s = s.substring(0, lastDot).replace(".", "") + s.substring(lastDot);
        }
        try {
            return Double.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Outliers → null (ou défaut).
     * Exemple tMap : DataQualityUtils.cleanOutlier(DataQualityUtils.toDoublePrix(row1.MontantAchat))
     */
    public static Double cleanOutlier(Double value) {
        if (value == null) {
            return MONTANT_DEFAUT;
        }
        if (value < MONTANT_MIN || value > MONTANT_MAX) {
            return MONTANT_DEFAUT;
        }
        return value;
    }

    /** Nom / prénom en MAJUSCULES (trim). */
    public static String toUpperName(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        if (s.isEmpty()) {
            return null;
        }
        return s.toUpperCase(java.util.Locale.ROOT);
    }

    /** Pipeline complet montant (virgule→Double + outlier). */
    public static Double normalizeMontant(String raw) {
        return cleanOutlier(toDoublePrix(raw));
    }
}
