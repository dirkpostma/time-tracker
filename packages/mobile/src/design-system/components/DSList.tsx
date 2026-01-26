import React from 'react';
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { colors, spacing } from '../tokens';
import { DSText } from './DSText';
import { DSCenter } from './DSCenter';
import { DSLoadingIndicator } from './DSLoadingIndicator';
import { DSSeparator } from './DSSeparator';

export interface DSListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  showSeparators?: boolean;
  contentPadding?: boolean;
  testID?: string;
}

export function DSList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  loading = false,
  emptyMessage = 'No items',
  emptySubMessage,
  showSeparators = true,
  contentPadding = true,
  testID,
  ...props
}: DSListProps<T>) {
  if (loading) {
    return <DSLoadingIndicator fullScreen />;
  }

  const renderEmpty = () => (
    <DSCenter flex={1} padding="xxl">
      <DSText variant="body" color="secondary" weight="semibold" align="center">
        {emptyMessage}
      </DSText>
      {emptySubMessage && (
        <DSText variant="bodySmall" color="muted" align="center" style={styles.emptySubtext}>
          {emptySubMessage}
        </DSText>
      )}
    </DSCenter>
  );

  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => renderItem(item, index)}
      keyExtractor={keyExtractor}
      testID={testID}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
        ) : undefined
      }
      ListEmptyComponent={renderEmpty}
      ItemSeparatorComponent={showSeparators ? () => <DSSeparator /> : undefined}
      contentContainerStyle={[
        contentPadding && styles.contentPadding,
        data.length === 0 && styles.emptyContainer,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  contentPadding: {
    paddingVertical: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
  },
  emptySubtext: {
    marginTop: spacing.sm,
  },
});
