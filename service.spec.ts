package ext.cummins.part.mvc.builders;

import com.ptc.jca.mvc.components.JcaComponentParams;
import com.ptc.mvc.components.*;
import com.ptc.netmarkets.util.beans.NmCommandBean;
import com.ptc.netmarkets.util.beans.NmHelperBean;

import static com.ptc.core.components.descriptor.DescriptorConstants.ColumnIdentifiers.ICON;

import wt.fc.Persistable;
import wt.fc.QueryResult;

import org.apache.logging.log4j.*;
import wt.part.WTPart;
import wt.util.WTException;
import wt.vc.VersionControlHelper;
import wt.vc.Versioned;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@ComponentBuilder("ext.cummins.part.mvc.builders.TestDiscussionTable")
public class TestDiscussionTable extends AbstractComponentBuilder {
    private static final String CLASSNAME = TestDiscussionTable.class.getName();
    private static final Logger LOGGER = LogManager.getLogger(CLASSNAME);

    private static final String TYPE = "Type";
    private static final String TOPICS = "Topics/Comments";
    private static final String CREATEDDATE = "DATE";
    private static final String VERSION_VIEW_DISPLAY_NAME = "Version";

    @Override
    public ComponentConfig buildComponentConfig(ComponentParams params) throws WTException {
        LOGGER.debug("Enter >> DiscussionHistoryTableBuilder");

        ComponentConfigFactory factory = getComponentConfigFactory();
        TableConfig table = factory.newTableConfig();
        table.setLabel("Discussion History");
        table.setId("ext.cummins.part.mvc.builders.CumminsDiscussionHistoryTableBuilder");
        table.setSelectable(false);
        table.setShowCount(true);
        table.setActionModel("unsubscribed_forum_actions");
        table.setShowCustomViewLink(true);

        // Add columns
        ColumnConfig col1 = factory.newColumnConfig(ICON, true);
        col1.setLabel(TYPE);
        table.addComponent(col1);

        ColumnConfig col4 = factory.newColumnConfig("versionInfo.identifier.versionId", true);
        col4.setLabel(VERSION_VIEW_DISPLAY_NAME);
        table.addComponent(col4);

        ColumnConfig col5 = factory.newColumnConfig("url", false);
        col5.setDataUtilityId("getDiscussions");
        col5.setLabel(TOPICS);
        table.addComponent(col5);

        ColumnConfig col7 = factory.newColumnConfig(CREATEDDATE, false);
        col7.setLabel(CREATEDDATE);
        table.addComponent(col7);

        LOGGER.debug("End >> CumminsDiscussionHistoryTableBuilder");
        return table;
    }

    @Override
    public Object buildComponentData(ComponentConfig config, ComponentParams paramComponentParams) throws WTException, IOException {
        NmHelperBean nmHelperBean = ((JcaComponentParams) paramComponentParams).getHelperBean();
        NmCommandBean nmCommandBean = nmHelperBean.getNmCommandBean();

        Persistable requestObj = nmCommandBean.getPrimaryOid().getWtRef().getObject();
        WTPart wtpart = null;
        ArrayList<Object> listobj = new ArrayList<>();
        if (requestObj instanceof WTPart) {
            wtpart = (WTPart) requestObj;
            System.out.println("Request object is a WTPart: " + wtpart.getDisplayIdentifier());

            QueryResult versionQuery = VersionControlHelper.service.allVersionsOf(wtpart);
            if (versionQuery.size() == 0) {
                System.out.println("No versions found for part: " + wtpart.getDisplayIdentifier());
            } else {
                System.out.println("Found " + versionQuery.size() + " versions for part: " + wtpart.getDisplayIdentifier());
            }

            Set<String> versionIdentifiers = new HashSet<>();
            while (versionQuery.hasMoreElements()) {
                Versioned versioned = (Versioned) versionQuery.nextElement();
                if (versioned instanceof WTPart) {
                    WTPart versionPart = (WTPart) versioned;
                    String versionIdentifier = versionPart.getVersionIdentifier().getValue();
                    System.out.println("versionIdentifier: " + versionIdentifier);
                    if (!versionIdentifiers.add(versionIdentifier)) {
                        System.out.println("Duplicate version found: " + versionIdentifier);
                    } else {
                        listobj.add(versionPart);
                        System.out.println("Fetched version: " + versionPart.getDisplayIdentifier());
                    }
                }
            }
        } else {
            LOGGER.debug("Request object is not a WTPart.");
        }

        LOGGER.debug("Total elements fetched: " + listobj.size());
        return listobj;
    }
}
