import {ComponentProps} from 'react';
import styled from '@emotion/styled';

import PanelAlert from 'sentry/components/panels/panelAlert';
import {Organization} from 'sentry/types';
import withOrganization from 'sentry/utils/withOrganization';
import WidgetCard from 'sentry/views/dashboardsV2/widgetCard';

import {DashboardFilters, Widget} from './types';

const TABLE_ITEM_LIMIT = 20;

type Props = {
  index: string;
  isEditing: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  organization: Organization;
  widget: Widget;
  widgetLimitReached: boolean;
  dashboardFilters?: DashboardFilters;
  isMobile?: boolean;
  isPreview?: boolean;
  windowWidth?: number;
};

function SortableWidget(props: Props) {
  const {
    organization,
    widget,
    isEditing,
    widgetLimitReached,
    onDelete,
    onEdit,
    onDuplicate,
    isPreview,
    isMobile,
    windowWidth,
    index,
    dashboardFilters,
  } = props;

  const widgetProps: ComponentProps<typeof WidgetCard> = {
    widget,
    isEditing,
    widgetLimitReached,
    onDelete,
    onEdit,
    onDuplicate,
    showContextMenu: true,
    isPreview,
    showWidgetViewerButton: organization.features.includes('widget-viewer-modal'),
    index,
    dashboardFilters,
    renderErrorMessage: errorMessage => {
      return (
        typeof errorMessage === 'string' && (
          <PanelAlert type="error">{errorMessage}</PanelAlert>
        )
      );
    },
    isMobile,
    windowWidth,
    tableItemLimit: TABLE_ITEM_LIMIT,
  };

  return (
    <GridWidgetWrapper>
      <WidgetCard {...widgetProps} />
    </GridWidgetWrapper>
  );
}

export default withOrganization(SortableWidget);

const GridWidgetWrapper = styled('div')`
  height: 100%;
`;
